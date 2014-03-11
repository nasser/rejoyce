Rejoyce
=======
A [concatenative programming language](http://en.wikipedia.org/wiki/Concatenative_programming_language) inspired by [Manfred von Thun's Joy](http://en.wikipedia.org/wiki/Joy_(programming_language)).

Overview
--------
I'm fascinated by the simplicity of concatenative languages, and wonder about their practical applications. [Factor](http://factorcode.org/) is super interesting and a tool I am actively studying, but with Rejoyce I am trying to build something with far fewer moving parts.

This research is the basis for several concatenative/stack language projects I am working on.

Files
-----
* `rejoyce.html` - A reimplementation of my Joy interpreter inspired by [something Tims Gardner](http://timsgardner.com/) made. This is the 'stable' one.
* `rejoyce-xy.html` - Rejoyce with [XY](http://nsl.com/k/xy/xy.htm) stack-queue semantics. An experiment.
* `joy.html` - An attempt at a conceptually pure implementation of Joy. All tokens parse into functions that take and return stacks, as in von Thun's formalisms. This turned out to be a bad idea. Largely broken.

Usage
-----
Fire up the JavaScript console and use `Joy.repl.eval("")` or `Rejoyce.repl.eval("")` to write code. When plt.js gets built in REPL support this will be more seamless.

Name
----
The language is a reimagining of von Thun's Joy. A *re*imagining of *Joy*. *Rejoy*ce. Never mind.

Legal
-----
Copyright © 2014 Ramsey Nasser. Released under the MIT License.

Built with [plt.js](https://github.com/nasser/pltjs).