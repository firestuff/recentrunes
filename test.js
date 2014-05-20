test('Simple', function() {
  expect(0);
  var parser = new RecentRunes(mediawiki);
  var result = parser.parse('wikidoc',
'=== Heading ===\n\
This is a wiki doc.\n\
How about some <b>bold and <i>bold italic</i></b>.\n\
I would also love some <nowiki>nowiki <b>foo</b></nowiki>');
  console.log(result);
  document.body.appendChild(result[1]);
});
