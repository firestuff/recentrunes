#!/bin/sh

curl \
  --silent \
  --data compilation_level=ADVANCED_OPTIMIZATIONS \
  --data output_format=json \
  --data output_info=errors \
  --data output_info=warnings \
  --data language=ECMASCRIPT5 \
  --data warning_level=verbose \
  --data-urlencode "js_code@static/recentrunes.js" \
  http://closure-compiler.appspot.com/compile
echo

gjslint --strict static/recentrunes.js
gjslint --strict --nojsdoc static/test.js static/grammars/mediawiki.js
