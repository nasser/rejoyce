var mori = require("mori");

var context = {
  outkw: mori.keyword("out"),
  inkw: mori.keyword("in"),
  getOut: function(ctx) { return mori.get(ctx, context.outkw); },
  getIn: function(ctx) { return mori.get(ctx, context.inkw); },

  newBlankContext: function() {
    return context.newContext(mori.vector(), mori.list());
  },
    
  newContext: function(o, i) {
    if(typeof i === 'undefined' && typeof o !== 'undefined') {
      i = o;
      o = undefined;
    }
    o = o || mori.vector()
    return mori.hashMap(context.outkw, o, context.inkw, mori.into(mori.list(), mori.reverse(i)));
  },
  
  updateContext: function(ctx, o, i) {
    return mori.assoc(ctx, context.outkw, o, context.inkw, mori.into(mori.list(), mori.reverse(i)));
  },

  pushInputToContext: function(ctx, i) {
    return mori.assoc(ctx, context.inkw, mori.into(mori.list(), mori.concat(context.getIn(ctx), mori.reverse(i))));
  }  
}

module.exports = context;