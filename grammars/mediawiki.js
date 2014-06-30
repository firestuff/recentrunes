var mediawiki = {
  'b': rr.Node('b', rr.Sequence(
      rr.Literal("'''"),
      rr.Ref('wikichunk'),
      rr.Literal("'''"))),
  'del': rr.Node('del', rr.Sequence(
      rr.Literal('<strike>'),
      rr.Ref('wikichunk'),
      rr.Literal('</strike>'))),
  'h2': rr.Node('h2', rr.Sequence(
      rr.StartOfLine(),
      rr.Literal('== '),
      rr.SingleLineText(),
      rr.Literal(' =='),
      rr.EndOfLine())),
  'h3': rr.Node('h3', rr.Sequence(
      rr.StartOfLine(),
      rr.Literal('=== '),
      rr.SingleLineText(),
      rr.Literal(' ==='),
      rr.EndOfLine())),
  'h4': rr.Node('h4', rr.Sequence(
      rr.StartOfLine(),
      rr.Literal('==== '),
      rr.SingleLineText(),
      rr.Literal(' ===='),
      rr.EndOfLine())),
  'h5': rr.Node('h5', rr.Sequence(
      rr.StartOfLine(),
      rr.Literal('===== '),
      rr.SingleLineText(),
      rr.Literal(' ====='),
      rr.EndOfLine())),
  'h6': rr.Node('h6', rr.Sequence(
      rr.StartOfLine(),
      rr.Literal('====== '),
      rr.SingleLineText(),
      rr.Literal(' ======'),
      rr.EndOfLine())),
  'hr': rr.Node('hr', rr.Sequence(
      rr.StartOfLine(),
      rr.Literal('----'),
      rr.EndOfLine())),
  'i': rr.Node('i', rr.Sequence(
      rr.Literal("''"),
      rr.Ref('wikichunk'),
      rr.Literal("''"))),
  'nowiki': rr.Sequence(
      rr.Literal('<nowiki>'),
      rr.MultiLineText(),
      rr.Literal('</nowiki>')),
  'text': rr.MultiLineText(),
  'wikichunk': rr.Or(
      rr.Ref('b'),
      rr.Ref('del'),
      rr.Ref('h2'),
      rr.Ref('h3'),
      rr.Ref('h4'),
      rr.Ref('h5'),
      rr.Ref('h6'),
      rr.Ref('hr'),
      rr.Ref('i'),
      rr.Ref('nowiki'),
      rr.Ref('text')),
  'wikidoc': rr.Node('wikidoc', rr.Sequence(
      rr.ZeroOrMore(rr.Ref('wikichunk')),
      rr.EndOfText()))
};
