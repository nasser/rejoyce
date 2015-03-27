var mori = require("mori");
var context = require("./context");
var interop = require("./interop");

var _eval = {
  lookup: function(stack, token) {
    var lastMap = mori.last(mori.filter(function(v) { return mori.isMap(v) && mori.hasKey(v, token) }, stack));
    if(lastMap)
      return mori.get(lastMap, token)
    else
      throw "Word `" + token + "` not found!";
  },

  step: function(ctx) {
    var o = mori.get(ctx, context.outkw);
    var i = mori.get(ctx, context.inkw);
    
    var token  = mori.peek(i);
    i = mori.pop(i);
    var newO = o;
    var newI = i;
    
    if(mori.isSymbol(token)) {
      // symbol, interop or lookup
      if(token.name[0] === '`') {
        // interop, eval fn or value
        var t = token.name.substr(1);
        var evaled = eval(t);
        if(typeof evaled === 'function') evaled = interop.fn(evaled, t);
        newI = mori.conj(i, evaled);
        
      } else {
        // not interop, lookup
        var word = _eval.lookup(o, token);
        if(mori.isVector(word)) {
          newI = mori.into(i, mori.reverse(word));
        } else {
          newI = mori.conj(i, word);
        }
      }
      
    } else if(typeof token === 'function') {
      return token.call(null, mori.assoc(ctx, context.inkw, i));
      
    } else {
      newO = mori.conj(o, token);
      
    }
    
    return mori.assoc(ctx, context.outkw, newO, context.inkw, newI);
  },

  run: function(ctx, n) {
    var history = mori.vector(ctx);
    
    while(!mori.isEmpty(mori.get(ctx, context.inkw)) && (n === undefined || n-- > 0)) {
      ctx = _eval.step(ctx);
      history = mori.conj(history, ctx);
    }
    
    return history;
  }
}

module.exports = _eval;