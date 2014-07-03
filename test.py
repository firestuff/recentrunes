#!/usr/bin/python2.7

import recentrunes

parser = recentrunes.Parser.fromFile('grammars/mediawiki.js')
teststring = \
"""This is a paragraph with many text styles. This is ''italic'' and this 
is '''bold'''; this is '''''both'''''. This is <u>underline</u> as is 
<ins>this</ins>. This is <u>'''''underlined, bold and italic'''''</u>. 
This is <del>strikethrough</del>, as is <strike>this</strike>. Source 
code looks like <code>this</code>. Fixed width text looks like 
<tt>this</tt>. <pre>This sentence is inline pre-formatted, which stops 
'''''this from being bold and italic.'''''</pre> <nowiki>We can also 
stop <u>this from being underlined</u></nowiki>, or just try 
<<nowiki/>pre>interrupting cow style.</pre><!-- This is a comment and 
shouldn't be visible --><blockquote>This is a blockquote</blockquote>

== Header 2 ==
=== Header 3 ''with italics'' ===
==== Header 4 ====
===== Header 5 =====
====== Header 6 ======
----
* Item 1a
* Item 1b
** Item 2
*** Item 3
* Item 1c
# Item 1a
# Item 1b
## Item 2
### Item 3
# Item 1c
;I don't really understand what a definition is
: But blockquotes are easy
:: Even larger ones
::::: And really huge ones
 This line is pre-formatted and <del>not interpolated</del>
 This line is also pre-formatted"""

result = str(parser.parseFromString(teststring))
assert result == \
"""<wikidoc><p>This is a paragraph with many text styles. This is <i>italic</i> and this 
is <b>bold</b>; this is <b><i>both</i></b>. This is <u>underline</u> as is 
<u>this</u>. This is <u><b><i>underlined, bold and italic</i></b></u>. 
This is <del>strikethrough</del>, as is <del>this</del>. Source 
code looks like <code>this</code>. Fixed width text looks like 
<tt>this</tt>. <pre>This sentence is inline pre-formatted, which stops 
'''''this from being bold and italic.'''''</pre> We can also 
stop &lt;u&gt;this from being underlined&lt;/u&gt;, or just try 
&lt;pre&gt;interrupting cow style.&lt;/pre&gt;<blockquote>This is a blockquote</blockquote></p><p><h2>Header 2</h2><h3>Header 3 <i>with italics</i></h3><h4>Header 4</h4><h5>Header 5</h5><h6>Header 6</h6><hr></hr><ul><li>Item 1a</li><li>Item 1b</li><ul><li>Item 2</li><ul><li>Item 3</li></ul></ul><li>Item 1c</li></ul><ol><li>Item 1a</li><li>Item 1b</li><ol><li>Item 2</li><ol><li>Item 3</li></ol></ol><li>Item 1c</li></ol><def>I don't really understand what a definition is</def><blockquote>But blockquotes are easy<blockquote>Even larger ones<blockquote><blockquote><blockquote>And really huge ones</blockquote></blockquote></blockquote></blockquote></blockquote><pre>This line is pre-formatted and &lt;del&gt;not interpolated&lt;/del&gt;
This line is also pre-formatted
</pre></p></wikidoc>""", result
