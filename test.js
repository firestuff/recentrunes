QUnit.test('Simple', function(assert) {
  assert.expect(1);
  var context = new rr.Context(mediawiki,
      '=== Heading ===\n' +
      'This is a wiki doc.\n' +
      "How about some '''bold and ''bold italic'''''.\n" +
      'I would also love some <nowiki>nowiki <b>foo</b></nowiki>');
  var iterable = context.rules['wikidoc'].match(context);
  assert.equal(iterable.next().value.nodes[0].innerHTML,
      '<h3>Heading</h3>This is a wiki doc.\n' +
      "How about some <b>bold and ''bold italic</b>''.\n" +
      'I would also love some nowiki &lt;b&gt;foo&lt;/b&gt;');
});


QUnit.test('ZeroOrMore', function(assert) {
  assert.expect(1);
  var rules = {
    'test': rr.Node('test',
        rr.Sequence(rr.ZeroOrMore(rr.MultiLineText()), rr.EndOfText()))
  };
  var context = new rr.Context(rules, 'foobar');
  var iterable = context.rules['test'].match(context);
  assert.equal(iterable.next().value.nodes[0].outerHTML,
      '<test>foobar</test>');
});
