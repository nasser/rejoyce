var mori = require("mori");
var ansi = require("ansi");
var Rejoyce = require("./rejoyce");

var repl = function() {
  this.code = "";
}

var code, stdin, ctx, prompt;
var prompt = "◆"

ctx = Rejoyce.newCoreContext();

code = '';

stdout = ansi(process.stdout);

stdin = process.openStdin();
stdin.on('data', function(buffer) {
  if (buffer) {
    code += buffer.toString();
    var nl = code.indexOf("\n");
    if(nl >= 0) {
      var nextCode = code.substr(0, nl);
      ctx = Rejoyce.context.pushInputToContext(ctx, Rejoyce.parse(nextCode));
      var history = Rejoyce.run(ctx);
      stdout.grey();
      for(var i = 1; i < mori.count(history)-1; i++) {
        var h = mori.get(history, i);
        if(typeof mori.peek(Rejoyce.context.getIn(h)) !== 'function')
          stdout.write(Rejoyce.print.log(h) + "\n")
      }
      stdout.reset();
      stdout.write(Rejoyce.print.log(mori.last(history)));
      
      ctx = mori.last(history);
      code = code.substr(nl+1);
    }
  }
});

stdin.on('end', function() {
  console.log("\n");
});

stdout.write(prompt + " ");