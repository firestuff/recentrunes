asyncTest('Simple', function() {
//  expect(1);
  var parser = new RecentRunes(mediawiki);
  console.log('foo');
  var result = parser.parseString('wikidoc',
'=== Heading ===\n\
This is a wiki doc.\n\
How about some <b>bold and <i>bold italic</i></b>.\n\
I would also love some <nowiki>nowiki <b>foo</b></nowiki>');
  console.log(result);
  document.body.appendChild(result);
});
