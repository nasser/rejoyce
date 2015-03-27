module.exports = {
  ":print/name": "core",
  // ":print/hide": true,
  
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
}