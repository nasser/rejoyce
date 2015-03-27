var edn = require("jsedn");
var mori = require("mori");

// unicode hack
edn.Symbol.prototype.validRegex = /[^ ]+/

var parser = {
  // convert to mori objects
  parseForm: function(form) {
    if(form.keys && form.vals) {
      // map {k v ...}
      return mori.zipmap(form.keys.map(parser.parseForm), form.vals.map(parser.parseForm));
    } else if(form.val && form.val.map) {
      // vector [a b c ...]
      return form.val.map(parser.parseForm);
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
      function(v) { return v.val.map(parser.parseForm) },
      mori.toClj);
  }
}

module.exports = parser;