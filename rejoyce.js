var mori = require("mori");

var Rejoyce = {};

Rejoyce.parser = require("./parser");
Rejoyce.context = require("./context");
Rejoyce.eval = require("./eval");
Rejoyce.interop = require("./interop");
Rejoyce.print = require("./print");

// api
Rejoyce.parse = Rejoyce.parser.parse;
Rejoyce.run = Rejoyce.eval.run;

var core = require("./core");
Rejoyce.newCoreContext = function() {
  return Rejoyce.context.newContext(mori.vector(Rejoyce.interop.module(core)), mori.list());
}

module.exports = Rejoyce;

