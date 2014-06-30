QUnit.module('mediawiki');

QUnit.test('Base', function(assert) {
  assert.expect(1);
  var content = [
    "This is a paragraph with many text styles. This is ''italic'' and this ",
    "is '''bold'''; this is '''''both'''''. This is <u>underline</u> as is ",
    "<ins>this</ins>. This is <u>'''''underlined, bold and italic'''''</u>. ",
    'This is <del>strikethrough</del>, as is <strike>this</strike>. Source ',
    'code looks like <code>this</code>. Fixed width text looks like',
    '<tt>this</tt>. <pre>This sentence is inline pre-formatted, which stops ',
    "'''''this from being bold and italic.'''''</pre> <nowiki>We can also ",
    'stop <u>this from being underlined</u></nowiki>, or just try ',
    '<<nowiki/>pre>interrupting cow style.</pre><!-- This is a comment and ',
    "shouldn't be visible --><blockquote>This is a blockquote</blockquote>",
    '',
    '== Header 2 ==',
    "=== Header 3 ''with italics'' ===",
    '==== Header 4 ====',
    '===== Header 5 =====',
    '====== Header 6 ======',
    '----',
    '* Item 1a',
    '* Item 1b',
    '** Item 2',
    '*** Item 3',
    '* Item 1c',
    '# Item 1a',
    '# Item 1b',
    '## Item 2',
    '### Item 3',
    '# Item 1c',
    ";I don't really understand what a definition is",
    ': But blockquotes are easy',
    ':: Even larger ones',
    '::::: And really huge ones'
  ].join('\n');
  var context = new rr.Context(mediawiki, content);
  var iterable = context.rules['wikidoc'].match(context);
  assert.equal(iterable.next().value.nodes[0].innerHTML,
      '');
});
