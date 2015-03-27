var util = require("util");
var mori = require("mori");

module.exports = {
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