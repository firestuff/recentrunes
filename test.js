QUnit.module('mediawiki');

QUnit.test('Base', function(assert) {
  assert.expect(1);
  var content = [
    "This is a paragraph with many text styles. This is ''italic'' and this ",
    "is '''bold'''; this is '''''both'''''. This is <u>underline</u> as is ",
    "<ins>this</ins>. This is <u>'''''underlined, bold and italic'''''</u>. ",
    'This is <del>strikethrough</del>, as is <strike>this</strike>. Source ',
    'code looks like <code>this</code>. Fixed width text looks like ',
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

  var expected = [
    '<p>This is a paragraph with many text styles. This is <i>italic</i> and ',
    'this \nis <b>bold</b>; this is <bi>both</bi>. This is <u>underline</u> ',
    'as is \n<u>this</u>. This is <u><bi>underlined, bold and italic</bi>',
    '</u>. \nThis is <del>strikethrough</del>, as is <del>this</del>. Source ',
    '\ncode looks like <code>this</code>. Fixed width text looks like \n',
    '<tt>this</tt>. <pre>This sentence is inline pre-formatted, which stops \n',
    "'''''this from being bold and italic.'''''</pre> We can also \nstop ",
    '&lt;u&gt;this from being underlined&lt;/u&gt;, or just try \n',
    '&lt;pre&gt;interrupting cow style.&lt;/pre&gt;<comment>This is a ',
    "comment and \nshouldn't be visible</comment><blockquote>This is a ",
    "blockquote</blockquote></p><p><h2>Header 2</h2><h3>Header 3 ''with ",
    "italics''</h3><h4>Header 4</h4><h5>Header 5</h5><h6>Header 6</h6><hr>",
    '<ulli1>Item 1a</ulli1><ulli1>Item 1b</ulli1><ulli2>Item 2</ulli2><ulli3>',
    'Item 3</ulli3><ulli1>Item 1c</ulli1><olli1>Item 1a</olli1><olli1>Item 1b',
    '</olli1><olli2>Item 2</olli2><olli3>Item 3</olli3><olli1>Item 1c</olli1>',
    "<def>I don't really understand what a definition is</def><blockquote>",
    'But blockquotes are easy</blockquote><blockquote2>Even larger ones',
    '</blockquote2><blockquote5>And really huge ones</blockquote5></p>'
  ].join('');

  var context = new rr.Context(mediawiki, content);
  var iterable = context.rules['wikidoc'].match(context);
  assert.equal(iterable.next().value.nodes[0].innerHTML, expected);
});
