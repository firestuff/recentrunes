badpenny = rr.Parser({
  'container': rr.Node('container',
      rr.Save('tagname',
        rr.Sequence(
          rr.Literal('{{('),
          rr.SingleLineText(),
          rr.Literal('}}')),
        rr.Sequence(
          rr.Literal('{{('),
          rr.Node('name', rr.SingleLineText()),
          rr.Literal('}}'),
          rr.MultiLineText(),
          rr.Literal('{{)'),
          rr.SavedLiteral('tagname'),
          rr.Literal('}}')))),

  'repeated': rr.Node('repeated',
      rr.Save('tagname',
        rr.Sequence(
          rr.Literal('{{['),
          rr.SingleLineText(),
          rr.Literal('}}')),
        rr.Sequence(
          rr.Literal('{{['),
          rr.Node('name', rr.SingleLineText()),
          rr.Literal('}}'),
          rr.MultiLineText(),
          rr.Literal('{{]'),
          rr.SavedLiteral('tagname'),
          rr.Literal('}}')))),

  'value': rr.Node('value', rr.Sequence(
      rr.Literal('{{'),
      rr.Node('name', rr.SingleLineText()),
      rr.Literal('}}'))),

  'chunk': rr.Or(
      rr.Ref('container'),
      rr.Ref('repeated'),
      rr.Ref('value'),
      rr.MultiLineText()),

  'main': rr.Node('badpenny', rr.Sequence(
      rr.ZeroOrMore(rr.Ref('chunk')),
      rr.EndOfText()))
}, [
  rr.ChildToAttribute('container', 'name'),
  rr.ChildToAttribute('repeated', 'name'),
  rr.ChildToAttribute('value', 'name')
]);
