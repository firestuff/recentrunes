asyncTest('Simple', function() {
  var context = new rr.Context(mediawiki, 
"=== Heading ===\n\
This is a wiki doc.\n\
How about some '''bold and <i>bold italic</i>'''.\n\
I would also love some <nowiki>nowiki <b>foo</b></nowiki>");
  var iterable = context.rules['wikidoc'].match(context);
  console.log(iterable.next());
});
