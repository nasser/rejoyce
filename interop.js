var context = require("./context");
var mori = require("mori");

var interop = {
  fn: function(f, n) {
    var arity = f.length;
    g = function(ctx) {
      var o = context.getOut(ctx);
      var i = context.getIn(ctx);
      var c = mori.count(o);
      var args = mori.intoArray(mori.subvec(o, c-arity, c));
      o = mori.subvec(o, 0, c-arity);
      var ret = f.apply(ctx, args);
      if(typeof ret === 'undefined') {
        // no return, unmodified context
        return mori.assoc(ctx, context.outkw, o, context.inkw, i);
      } else if(typeof ret.length !== 'undefined') {
        // array return, push multiple values to out
        return mori.assoc(ctx, context.outkw, mori.into(o, ret), context.inkw, i);
      } else {
        // primitive return, push value to out
        return mori.assoc(ctx, context.outkw, mori.conj(o, ret), context.inkw, i);
      }
    }
    
    if(typeof n === 'undefined')
      g.toString = function() { return "…" }
    else
      g.toString = function() { return n }
    
    g.inspect = function() { return "#<" + this.toString() + ">" }
    
    return g;
  },

  module: function(m) {
    var hm = mori.hashMap();
    for(k in m) {
      var v = m[k];
      if(typeof v == 'function') {
        hm = mori.assoc(hm, mori.symbol(k), interop.fn(v, k));
      } else {
        hm = mori.assoc(hm, mori.symbol(k), v);
      }
    }
    return hm;
  }  
}

module.exports = interop;