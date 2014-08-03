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
    '::::: And really huge ones',
    ' This line is pre-formatted and <del>not interpolated</del>',
    ' This line is also pre-formatted'
  ].join('\n');

  var expected = [
    '<p>This is a paragraph with many text styles. This is <i>italic</i> and ',
    'this \nis <b>bold</b>; this is <b><i>both</i></b>. This is <u>underline',
    '</u> as is \n<u>this</u>. This is <u><b><i>underlined, bold and italic',
    '</i></b></u>. \nThis is <del>strikethrough</del>, as is <del>this</del>. ',
    'Source \ncode looks like <code>this</code>. Fixed width text looks like ',
    '\n<tt>this</tt>. <pre>This sentence is inline pre-formatted, which stops',
    " \n'''''this from being bold and italic.'''''</pre> We can also \nstop ",
    '&lt;u&gt;this from being underlined&lt;/u&gt;, or just try \n',
    '&lt;pre&gt;interrupting cow style.&lt;/pre&gt;<blockquote>This is a ',
    'blockquote</blockquote></p><p><h2>Header 2</h2><h3>Header 3 <i>with ',
    'italics</i></h3><h4>Header 4</h4><h5>Header 5</h5><h6>Header 6</h6><hr>',
    '<ul><li>Item 1a</li><li>Item 1b</li><ul><li>Item 2</li><ul><li>Item 3',
    '</li></ul></ul><li>Item 1c</li></ul><ol><li>Item 1a</li><li>Item 1b</li>',
    '<ol><li>Item 2</li><ol><li>Item 3</li></ol></ol><li>Item 1c</li></ol>',
    "<def>I don't really understand what a definition is</def><blockquote>",
    'But blockquotes are easy<blockquote>Even larger ones<blockquote>',
    '<blockquote><blockquote>And really huge ones</blockquote></blockquote>',
    '</blockquote></blockquote></blockquote><pre>This line is pre-formatted ',
    'and &lt;del&gt;not interpolated&lt;/del&gt;\nThis line is also ',
    'pre-formatted\n</pre></p>'
  ].join('');

  assert.equal(mediawiki.parseFromString(content).innerHTML, expected);
});

QUnit.test('singleline-wikichunk', function(assert) {
  assert.expect(1);
  var content = [
    "Regular line ''with italics''",
    "=== Header 3 ''with italics'' ==="
  ].join('\n');

  var expected = [
    '<p>Regular line <i>with italics</i>',
    '<h3>Header 3 <i>with italics</i></h3></p>'
  ].join('');

  assert.equal(mediawiki.parseFromString(content).innerHTML, expected);
});

QUnit.test('Link', function(assert) {
  assert.expect(1);
  var content = [
    "[[http://www.example.com/foo|Test text ''with formatting'']]"
  ].join('\n');

  var expected = [
    '<p><a href="http://www.example.com/foo">Test text <i>with formatting</i>',
    '</a></p>'
  ].join('');

  assert.equal(mediawiki.parseFromString(content).innerHTML, expected);
});

QUnit.test('Figure', function(assert) {
  assert.expect(1);
  var content = [
    "[[File:http://www.example.com/foo|Test image ''with formatting'']]"
  ].join('\n');

  var expected = [
    '<p><figure><img src="http://www.example.com/foo"><figcaption>Test image ',
    '<i>with formatting</i></figcaption></figure></p>'
  ].join('');

  assert.equal(mediawiki.parseFromString(content).innerHTML, expected);
});


QUnit.module('badpenny');

QUnit.test('Base', function(assert) {
  assert.expect(1);
  var content = [
    'foo{{value1}}bar',
    'foo{{(container1}}contents{{)nottheend}}more contents{{)container1}}bar',
    'foo{{[repeated1}}testing{{]notthis}}{{)repeated1}}zig{{]repeated1}}bar'
  ].join('\n');

  var expected = [
    'foo<value name="value1"></value>bar\n',
    'foo<container name="container1">contents{{)nottheend}}more contents',
    '</container>bar\n',
    'foo<repeated name="repeated1">testing{{]notthis}}{{)repeated1}}zig',
    '</repeated>bar'
  ].join('');

  assert.equal(badpenny.parseFromString(content).innerHTML, expected);
});
