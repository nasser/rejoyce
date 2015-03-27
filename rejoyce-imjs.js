var util = require("util");
var PEG = require("pegjs");

var Immutable = require("immutable");
var List = Immutable.List;
var Map = Immutable.Map;

var parser = require("./parser");

// state of execution, a stack and a queue 
var Rejoyce = function(stack, queue) {
  this.stack = stack;
  this.queue = queue;
};


// types
Rejoyce.Word = function Word(w) {
  if(this instanceof Word) {
    this.word = w;
    Rejoyce.Word.cache[w] = this;
    
  } else {
    return Rejoyce.Word.cache[w] || new Rejoyce.Word(w);
    
  }
}
Rejoyce.Word.cache = {};
Rejoyce.Word.prototype.toString = function() { return this.word; };
Rejoyce.Word.prototype.inspect = function() { return this.toString(); };

// parsing
Rejoyce.grammar = "\
  { var Immutable = options.Immutable; var Rejoyce = options.Rejoyce }\
  start                         = p:program { return Immutable.fromJS(p) }\
\
  program                       = literal*\
\
  literal                       = l:(quotation / map / string / number / word) space { return l }\
\
  quotation                     = '[' space p:program ']' { return Immutable.List(p) }\
\
  map                           = '{' space m:(literal literal)* '}' { return Immutable.Map(m) }\
\
  string                        = '\"' s:[^\"]+ '\"' { return s.join('') }\
\
  word                          = punctuation_word / alphanumeric_word\
  alphanumeric_word             = w:[^\\[\\]\\{\\} ]+ { return Rejoyce.Word(w.join('').trim()) }\
  punctuation_word              = w:[`!~@#$%^&*\\(\\)]+ { return Rejoyce.Word(w.join('').trim()) }\
\
  number                        = n:(float_between_01 / float / integer) (space / '[' / ']') { return n }\
  float                         = s:sign n:digit+ '.' m:digit+ { return parseFloat( s + n.join('') + \".\" + m.join('') )}\
  float_between_01              = s:sign '.' n:digit+ { return parseFloat( s + \"0.\" + n.join('') )}\
  integer                       = s:sign n:digit+ { return parseInt(s + n.join('')) }\
  sign                          = s:'-'? { return s ? '-' : '' }\
  digit                         = [0123456789]\
\
  space                         = [ ]* / !. { return undefined }\
  mandatory_space               = [ ]+ / !. { return undefined }"

Rejoyce.parser = PEG.buildParser(Rejoyce.grammar);
  
Rejoyce.parse = function(src) {
  return Rejoyce.parser.parse(src, {Immutable:Immutable, Rejoyce:Rejoyce})
}


// inspecting
Rejoyce.inspect = function(v) {
  if(v && v.constructor && Rejoyce.inspect.fns[v.constructor.name])
    return Rejoyce.inspect.fns[v.constructor.name](v);
  else
    return util.inspect(v);
}

Rejoyce.inspect.fns = {
  "Word": function(w) {
    return w.word;
  },
  
  "List": function(l) {
    return "[" + l.map(Rejoyce.inspect).toJS().join(" ") + "]";
  },
  
  "Map": function(m) {
    function wrap(lst) { return "{" + lst.toJS().join(", ") + "}" }
    
    var fullInspect = wrap(m.entrySeq().map(function(kv) { return Rejoyce.inspect(kv[0]) + " " + Rejoyce.inspect(kv[1]) }))
    if(fullInspect.length < 40) return fullInspect;
    
    var shortInspect = wrap(m.keySeq().map(Rejoyce.inspect))
    if(shortInspect.length < 40) return shortInspect;
    
    return "{…}"
  }
}

Rejoyce.prototype.inspectStack = function() {
  return Rejoyce.inspect(this.stack || []);
}

Rejoyce.prototype.inspectQueue = function() {
  return Rejoyce.inspect(this.queue || []);
}

Rejoyce.prototype.inspect = function() {
  return this.inspectStack() + " ◆ " + this.inspectQueue();
};

Rejoyce.prototype.log = function(width) {
  // http://stackoverflow.com/questions/202605/repeat-string-javascript
  function padding(n) {
    return new Array( n > 0 ? n : 0 ).join( " " );
  }
  
  width = width || Math.floor(process.stdout.columns/2); 
  var s = this.inspectStack();
  var q = this.inspectQueue();

  console.log(
    padding( width - s.length ), s, "◆", q);
};


// execution
Rejoyce.prototype.lookup = function(token) {
  var lastMap = this.stack.findLast(function(l) { return Map.isMap(l) && l.has(token) });
  if(lastMap)
    return lastMap.get(token);
  else
    throw "Word `" + token + "` not found!";
};

Rejoyce.prototype.step = function() {
  var token = this.queue.first();
  var queue = this.queue.shift();
  
  if(token && token instanceof Rejoyce.Word) {
    var word = this.lookup(token);
    if(word.call) {
      return word.call(null, new Rejoyce(this.stack, this.queue.shift()));
    } else if(List.isList(word)) {
      return new Rejoyce(this.stack, word.concat(queue));
    } else {
      return new Rejoyce(this.stack.push(word), queue);
    }
  } else {
    return new Rejoyce(this.stack.push(token), queue);
  }
};

Rejoyce.prototype.run = function(n) {
  var ctx = this;
  var history = List([ctx]);
  
  while(ctx.queue.size > 0 && (n === undefined || n-- > 0)) {
    ctx = ctx.step();
    history = history.push(ctx);
  }
  
  return history;
};


// core
Rejoyce.coreFunction = function(fn) {
  var arity = fn.length;
  return function(ctx) {
    var s = ctx.stack, q = ctx.queue;
    var args = s.slice(-arity).toArray();
    while(arity-- > 0) s = s.pop();
    return new Rejoyce(s.concat(fn.apply(null, args)), q);
  }
}

var core = Map([
  [Rejoyce.Word('+'), Rejoyce.coreFunction(function(a, b) { return a + b; })],
  [Rejoyce.Word('-'), Rejoyce.coreFunction(function(a, b) { return a - b; })],
  [Rejoyce.Word('*'), Rejoyce.coreFunction(function(a, b) { return a * b; })],
  [Rejoyce.Word('/'), Rejoyce.coreFunction(function(a, b) { return a / b; })],
  
  [Rejoyce.Word('dup'), Rejoyce.coreFunction(function(x) { return [x, x] })]
]);


var r = new Rejoyce(Immutable.fromJS([core]), Rejoyce.parse("{sq [dup *]} 5 6 + sq"));
r.run().forEach(function(h) { h.log() });

