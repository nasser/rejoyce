edn-tests
=========

This is a common set of edn tests intended to be used by anyone implementing an edn library. 

If you would like to fork it and add your platform under platforms with the expected equivalent readable forms for your platform that would be awesome. 

e.g.

/valid-edn/vector.edn `[1 2 3]`

/platforms/js/vector.js `[1, 2, 3]`  

Feel free to add a directory for your specific implementation under the relevant platfom which contains the forms as understood by your implemenation. 

e.g.

/platforms/js/jsedn/vector.js `new edn.Vector([1, 2, 3])`


###valid-edn
Your implementation should be able to parse all of these files into the corresponding output under platforms/[your platform].

###invalid-edn
Your implementation should NOT be able to parse these forms. Ideally a meaningful error/exception should be provided indicating the reason. 

###performance
Useful for benchmarking an implemenation. Eventually it will be used for comparing various implemenatations on the same hardware.

##Current Platforms

* clojure

* js

* php

* ruby

* python


