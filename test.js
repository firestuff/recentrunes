QUnit.test('Simple', function(assert) {
  assert.expect(1);
  var context = new rr.Context(mediawiki,
      '=== Heading ===\n' +
      'This is a wiki doc.\n' +
      "How about some '''bold and <i>bold italic</i>'''.\n" +
      'I would also love some <nowiki>nowiki <b>foo</b></nowiki>');
  var iterable = context.rules['wikidoc'].match(context);
  assert.equal(iterable.next().value.nodes[0].innerHTML,
      '<h3>Heading</h3>This is a wiki doc.\n' +
      'How about some <b>bold and &lt;i&gt;bold italic&lt;/i&gt;</b>.\n' +
      'I would also love some nowiki &lt;b&gt;foo&lt;/b&gt;');
});
