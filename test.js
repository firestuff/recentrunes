test('Simple', function() {
  expect(0);
  var grammar = {
    'rule1': [rr.Literal('=== '), rr.SingleLineText(), rr.Literal(' ===')],
    'rule2': [rr.SingleLineText(), rr.Literal('=')],
  };
  var parser = new RecentRunes(grammar);
  console.log(parser.parse('rule1', '=== bar ==='));
  console.log(parser.parse('rule2', 'foo=\nbar='));
});
