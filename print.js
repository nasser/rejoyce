var util = require("util");
var mori = require("mori");
var context = require("./context");

var print = {
  inspect: function(v) {
    if(mori.isMap(v)) {
      if(mori.hasKey(v, mori.symbol(":print/name"))) {
        return undefined;
        
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
    return mori.toJs(mori.map(print.inspect, stack)).filter(function(f) {
      return f !== null;
    }).join(" ");
  },

  log: function(ctx, width) {
    // http://stackoverflow.com/questions/202605/repeat-string-javascript
    function padding(n) {
      return new Array( n > 0 ? n : 0 ).join( " " );
    }
    
    width = width || Math.floor(process.stdout.columns/2); 
    var o = print.inspectStack(context.getOut(ctx));
    var i = print.inspectStack(context.getIn(ctx));

    // return padding( width - o.length ) + o + " ◆ " + i;
    return o + " ◆ " + i;
  }
}

module.exports = print;