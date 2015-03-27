var util = require("util");
var edn = require("jsedn");
var mori = require("mori");

// unicode hack
edn.Symbol.prototype.validRegex = /[^ ]+/

var Rejoyce = {
  
  
  // parsing
  
  parseForm: function(form) {
    if(form.keys && form.vals) {
      // map {k v ...}
      return mori.zipmap(form.keys.map(Rejoyce.parseForm), form.vals.map(Rejoyce.parseForm));
    } else if(form.val && form.val.map) {
      // vector [a b c ...]
      return form.val.map(Rejoyce.parseForm);
    } else if(form.name) {
      // symbol
      return mori.symbol(form.val);
    } else {
      // all else
      return form;
    }
  },
  
  parse: function(source) {
    return mori.pipeline("[\n" + source + "\n]",
      edn.parse,
      function(v) { return v.val.map(Rejoyce.parseForm) },
      mori.toClj);
  },
  
  
  // contexts
  
  outkw: mori.keyword("out"),
  inkw: mori.keyword("in"),
  getOut: function(ctx) { return mori.get(ctx, Rejoyce.outkw); },
  getIn: function(ctx) { return mori.get(ctx, Rejoyce.inkw); },
  
  newContext: function(o, i) {
    return mori.hashMap(Rejoyce.outkw, o, Rejoyce.inkw, mori.into(mori.list(), mori.reverse(i)));
  },
  
  pushInputToContext: function(ctx, i) {
    return mori.assoc(ctx, Rejoyce.inkw, mori.into(mori.list(), mori.concat(Rejoyce.getIn(ctx), mori.reverse(i))));
  },
  
  
  // core semantics
  
  lookup: function(stack, token) {
    var lastMap = mori.last(mori.filter(function(v) { return mori.isMap(v) && mori.hasKey(v, token) }, stack));
    if(lastMap)
      return mori.get(lastMap, token)
    else
      throw "Word `" + token + "` not found!";
  },
  
  step: function(ctx) {
    var o = mori.get(ctx, Rejoyce.outkw);
    var i = mori.get(ctx, Rejoyce.inkw);
    
    var token  = mori.peek(i);
    i = mori.pop(i);
    var newO = o;
    var newI = i;
    
    if(mori.isSymbol(token)) {
      // symbol, interop or lookup
      if(token.name[0] === '`') {
        // interop, eval fn or value
        var t = token.name.substr(1);
        var interop = eval(t);
        if(typeof interop === 'function') interop = Rejoyce.jsFn(interop, t);
        newI = mori.conj(i, interop);
        
      } else {
        // not interop, lookup
        var word = Rejoyce.lookup(o, token);
        if(mori.isVector(word)) {
          newI = mori.into(i, mori.reverse(word));
        } else {
          newI = mori.conj(i, word);
        }
      }
      
    } else if(typeof token === 'function') {
      return token.call(null, mori.assoc(ctx, Rejoyce.inkw, i));
      
    } else {
      newO = mori.conj(o, token);
      
    }
    
    return mori.assoc(ctx, Rejoyce.outkw, newO, Rejoyce.inkw, newI);
  },
  
  run: function(ctx, n) {
    var history = mori.vector(ctx);
    
    while(!mori.isEmpty(mori.get(ctx, Rejoyce.inkw)) && (n === undefined || n-- > 0)) {
      ctx = Rejoyce.step(ctx);
      history = mori.conj(history, ctx);
    }
    
    return history;
  },
  
  
  // js wrapping
  
  jsFn: function(fn, n) {
    var arity = fn.length;
    f = function(ctx) {
      var o = Rejoyce.getOut(ctx);
      var i = Rejoyce.getIn(ctx);
      var c = mori.count(o);
      var args = mori.intoArray(mori.subvec(o, c-arity, c));
      o = mori.subvec(o, 0, c-arity);
      var ret = fn.apply(ctx, args);
      if(typeof ret === 'undefined') {
        // no return, unmodified context
        return mori.assoc(ctx, Rejoyce.outkw, o, Rejoyce.inkw, i);
      } else if(typeof ret.length !== 'undefined') {
        // array return, push multiple values to out
        return mori.assoc(ctx, Rejoyce.outkw, mori.into(o, ret), Rejoyce.inkw, i);
      } else {
        // primitive return, push value to out
        return mori.assoc(ctx, Rejoyce.outkw, mori.conj(o, ret), Rejoyce.inkw, i);
      }
    }
    
    if(typeof n === 'undefined')
      f.toString = function() { return "…" }
    else
      f.toString = function() { return n }
    
    f.inspect = function() { return "#<" + this.toString() + ">" }
    
    return f;
  },
  
  jsModule: function(m) {
    var hm = mori.hashMap();
    for(k in m) {
      var v = m[k];
      if(typeof v == 'function') {
        hm = mori.assoc(hm, mori.symbol(k), Rejoyce.jsFn(v, k));
      } else {
        hm = mori.assoc(hm, mori.symbol(k), v);
      }
    }
    return hm;
  },
  
  
  // inspecting
  
  inspect: function(v) {
    if(mori.isMap(v)) {
      if(mori.hasKey(v, mori.symbol(":print/name"))) {
        return null
        
      } else if(mori.hasKey(v, mori.symbol(":print/name"))) {
        return "{" + mori.get(v, mori.symbol(":print/name")) + "}";
      } else {
        return util.inspect(v);
      }
      
    } else {
      return util.inspect(v)
      
    }
  },
  
  inspectStack: function(stack) {
    return mori.toJs(mori.map(Rejoyce.inspect, stack)).join(" ");
  },
  
  log: function(ctx, width) {
    // http://stackoverflow.com/questions/202605/repeat-string-javascript
    function padding(n) {
      return new Array( n > 0 ? n : 0 ).join( " " );
    }
    
    width = width || Math.floor(process.stdout.columns/2); 
    var o = Rejoyce.inspectStack(Rejoyce.getOut(ctx));
    var i = Rejoyce.inspectStack(Rejoyce.getIn(ctx));

    // return padding( width - o.length ) + o + " ◆ " + i;
    return o + " ◆ " + i;
  }
}

Rejoyce.core = Rejoyce.jsModule({
  ":print/name": "core",
  ":print/hide": true,
  
  "+": function(a, b) { return a + b },
  "-": function(a, b) { return a - b },
  "*": function(a, b) { return a * b },
  "/": function(a, b) { return a / b },
  
  dup: function(x) { return [x, x] },
  swap: function(x, y) { return [y, x] },
  rollup: function(x, y, z) { return [z, x, y] },
  rolldown: function(x, y, z) { return [y, z, x] },
  map: function(a, p) {
    return mori.map(function(v) {
      Rejoyce.run(Rejoyce.pushInputToContext(this, mori.cons(v, p)))
    }, a);
  },
  ".": function(s) { console.log(s) }
});


// repl

var code, stdin, ctx, prompt;

ctx = Rejoyce.newContext(mori.vector(Rejoyce.core), mori.list());
prompt = " ◆ ";
code = '';

stdin = process.openStdin();
stdin.on('data', function(buffer) {
  if (buffer) {
    code += buffer.toString();
    var nl = code.indexOf("\n");
    if(nl >= 0) {
      var nextCode = code.substr(0, nl);
      ctx = Rejoyce.pushInputToContext(ctx, Rejoyce.parse(nextCode));
      var history = Rejoyce.run(ctx);
      for(var i = 1; i < mori.count(history)-1; i++) {
        var h = mori.get(history, i);
        if(typeof mori.peek(Rejoyce.getIn(h)) !== 'function')
          process.stdout.write(Rejoyce.log(h) + "\n")
      }
      process.stdout.write(Rejoyce.log(mori.last(history)));
      
      ctx = mori.last(history);
      code = code.substr(nl+1);
    }
  }
});

stdin.on('end', function() {
  console.log("\n");
});

process.stdout.write(prompt);














