php pack1.php
terser -c passes=2 -m --ecma 2017 -o picigl-debug.min.js -- tmp/picigl.debug.js
terser -c passes=2 -m --ecma 2017 -o picigl.min.js -- tmp/picigl.nodebug.js
