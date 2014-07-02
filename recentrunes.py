#!/usr/bin/python2.7

import collections

class MatchResult(collections.namedtuple('MatchResult', ['context', 'nodes'])):
  pass


class TextNode(object):
  def __init__(self, textContent):
    self.nodeName = '#text'
    self.parentNode = None
    self.textContent = textContent
    self.previousSibling = None
    self.nextSibling = None
    self.childNodes = []

  def cloneNode(self, deep):
    return TextNode(self.textContent)

  def getTextContent(self):
    return self.textContent

  def __str__(self):
    return (self.textContent
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;'))


class Element(object):
  def __init__(self, nodeName):
    self.nodeName = nodeName
    self.parentNode = None
    self.previousSibling = None
    self.nextSibling = None
    self.childNodes = []
    self.attributes = {}

  def appendChild(self, child):
    if child.parentNode:
      child.parentNode.removeChild(child)
    child.parentNode = self
    self.childNodes.append(child)
    if len(self.childNodes) == 1:
      child.previousSibling = None
    else:
      beforeChild = self.childNodes[len(self.childNodes) - 2]
      child.previousSibling = beforeChild
      beforeChild.nextSibling = child

  def removeChild(self, child):
    self.childNodes.remove(child)
    if child.previousSibling:
      child.previousSibling.nextSibling = child.nextSibling
    if child.nextSibling:
      child.nextSibling.previousSibling = child.previousSibling
    child.parentNode = None
    child.previousSibling = None
    child.nextSibling = None

  def replaceChild(self, newNode, oldNode):
    index = self.childNodes.index(oldNode)
    self.childNodes[index] = newNode
    newNode.parentNode = self
    newNode.previousSibling = oldNode.previousSibling
    newNode.nextSibling = oldNode.nextSibling
    if newNode.previousSibling:
      newNode.previousSibling.nextSibling = newNode
    if newNode.nextSibling:
      newNode.nextSibling.previousSibling = newNode
    oldNode.parentNode = None
    oldNode.previousSibling = None
    oldNode.nextSibling = None

  def normalize(self):
    lastTextNode = None
    for childNode in list(self.childNodes):
      if isinstance(childNode, TextNode):
        if lastTextNode:
          lastTextNode.textContent += childNode.textContent
          self.removeChild(childNode)
        else:
          lastTextNode = childNode
      else:
        lastTextNode = None

  def renameNode(self, nodeName):
    self.nodeName = nodeName

  def setAttribute(self, key, value):
    self.attributes[key] = value

  def getAttribute(self, key):
    return self.attributes[key]

  def cloneNode(self, deep):
    element = Element(self.nodeName)
    if not deep:
      return element
    for childNode in self.childNodes:
      element.appendChild(childNode.cloneNode(True))
    for key, value in self.attributes.iteritems():
      element.setAttribute(key, value)
    return element

  def getTextContent(self):
    return ''.join(x.getTextContent() for x in self.childNodes)

  def __str__(self):
    # TODO: attributes
    values = map(str, self.childNodes)
    return '<%s%s>%s</%s>' % (
        self.nodeName,
        ''.join(' %s="%s"' % (k, v.replace('"', '&quot;'))
                              for k, v in self.attributes.iteritems()),
        ''.join(values),
        self.nodeName)


# ============ Matchers ============


class Matcher(object):
  pass


class CharExcept(Matcher):
  def __init__(self, chars):
    self._chars = chars

  def match(self, context):
    c = context.stringAfter(1)
    if c and c not in self._chars:
      yield MatchResult(
          context.advance(1),
          [TextNode(c)])


class EndOfLine(Matcher):
  def match(self, context):
    if context.atEnd():
      yield MatchResult(
          context,
          [])
    if context.stringAfter(1) == '\n':
      yield MatchResult(
          context.advance(1),
          [])
    if context.stringBefore(1) == '\n':
      yield MatchResult(
          context,
          [])


class EndOfText(Matcher):
  def match(self, context):
    if context.atEnd():
      yield MatchResult(
          context,
          [])


class Hidden(Matcher):
  def __init__(self, child):
    self._child = child

  def match(self, context):
    for result in self._child.match(context):
      yield MatchResult(
          result.context,
          [])


class Insert(Matcher):
  def __init__(self, value):
    self._value = value

  def match(self, context):
    yield MatchResult(
        context,
        [TextNode(self._value)])


class Literal(Matcher):
  def __init__(self, value):
    self._value = value

  def match(self, context):
    if context.stringAfter(len(self._value)) == self._value:
      yield MatchResult(
          context.advance(len(self._value)),
          [])


class Node(Matcher):
  def __init__(self, name, child):
    self._name = name
    self._child = child

  def match(self, context):
    for result in self._child.match(context):
      element = Element(self._name)
      for node in result.nodes:
        element.appendChild(node.cloneNode(True))
      element.normalize()
      yield MatchResult(
          result.context,
          [element])


class Or(Matcher):
  def __init__(self, *options):
    self._options = options

  def match(self, context):
    for option in self._options:
      for result in option.match(context):
        yield result


class Ref(Matcher):
  def __init__(self, key):
    self._key = key

  def match(self, context):
    return context.rules[self._key].match(context)


class SequentialPair(Matcher):
  def __init__(self, child1, child2):
    self._child1 = child1
    self._child2 = child2

  def match(self, context):
    for result1 in self._child1.match(context):
      for result2 in self._child2.match(result1.context):
        yield MatchResult(
            result2.context,
            result1.nodes + result2.nodes)


class StartOfLine(Matcher):
  def match(self, context):
    if context.atStart():
      yield MatchResult(
          context,
          [])
    if context.stringAfter(1) == '\n':
      yield MatchResult(
          context.advance(1),
          [])
    if context.stringBefore(1) == '\n':
      yield MatchResult(
          context,
          [])


class ZeroOrMore(Matcher):
  def __init__(self, child):
    self._pair = SequentialPair(child, self)

  def match(self, context):
    yield MatchResult(
        context,
        [])
    for result in self._pair.match(context):
      if result.context.remaining() == context.remaining():
        raise Exception(
        "Child or ZeroOrMore didn't consume input; grammar bug?")
      yield result


# ============ Convenience factories ============


def Char():
  return CharExcept('')


def MultiLineText():
  return OneOrMore(Char())


def OneOrMore(child):
  return SequentialPair(child, ZeroOrMore(child))


def Sequence(*children):
  if len(children) == 1:
    return children[0]
  return SequentialPair(
      children[0],
      Sequence(*children[1:]))


def SingleLineText():
  return OneOrMore(CharExcept('\n'))



# ============ Filter factories ============


def ChildToAttribute(parentName, childName):
  def Filter(node):
    if node.nodeName != parentName:
      return
    for childNode in node.childNodes:
      if childNode.nodeName == childName:
        node.setAttribute(childName, childNode.getTextContent())
        node.removeChild(childNode)
        break
  return Filter


def ExtractElement(nodeName):
  def Filter(node):
    if node.nodeName != nodeName:
      return
    parentNode = node.parentNode
    for childNode in node.childNodes:
      parentNode.appendChild(childNode)
    parentNode.removeChild(node)
    parentNode.normalize()
  return Filter


def GroupSiblings(parentName, childNames):
  def Filter(node):
    if node.nodeName not in childNames:
      return
    if (node.previousSibling and
        node.previousSibling.nodeName == parentName):
      node.previousSibling.appendChild(node)
      return
    newNode = Element(parentName)
    node.parentNode.replaceChild(newNode, node)
    newNode.appendChild(node)
  return Filter


def RenameElement(oldName, newName):
  def Filter(node):
    if node.nodeName != oldName:
      return
    node.renameNode(newName)
  return Filter


def SplitElementAndNest(originalName, newNames):
  def Filter(node):
    if node.nodeName != originalName:
      return
    outerNode = innerNode = None
    for newName in newNames:
      newNode = Element(newName)
      if not outerNode:
        outerNode = innerNode = newNode
      else:
        innerNode.appendChild(newNode)
        innerNode = newNode
    for childNode in node.childNodes:
      innerNode.appendChild(childNode)
    node.parentNode.replaceChild(outerNode, node)
  return Filter



# ============ Scaffolding ============


def ApplyFilter(node, callback):
  callback(node)
  for childNode in list(node.childNodes):
    ApplyFilter(childNode, callback)


def ApplyFilters(node, filters):
  for callback in filters:
    ApplyFilter(node, callback)


class Context(object):
  def __init__(self, rules, string, inputIndex=0):
    self.rules = rules
    self.string = string
    self.inputIndex = inputIndex

  def copy(self):
    return Context(self.rules, self.string, self.inputIndex)

  def stringAfter(self, numChars=None):
    if numChars is None:
      numChars = self.remaining()
    return self.string[self.inputIndex:self.inputIndex + numChars]

  def stringBefore(self, numChars):
    start = self.inputIndex - numChars
    if start < 0:
      numChars += start
      start = 0
    return self.string[start:start + numChars]

  def atStart(self):
    return self.inputIndex == 0

  def atEnd(self):
    return self.remaining() == 0

  def remaining(self):
    return len(self.string) - self.inputIndex

  def advance(self, numChars):
    if not numChars:
      raise Exception('Context.advance(0) called')
    context = self.copy()
    context.inputIndex += numChars
    return context


class Parser(object):
  @classmethod
  def fromFile(cls, filename):
    fh = open(filename, 'r')
    grammar = fh.read()
    compiled = compile(grammar, filename, 'exec')
    glbls = {
        'rr': rr(),
    }
    eval(compiled, glbls)
    newKeys = (set(glbls) - {'__builtins__', 'rr'})
    assert len(newKeys) == 1, newKeys
    value = glbls[newKeys.pop()]
    assert isinstance(value, cls), value
    return value

  def __init__(self, rules, filters):
    self.rules = rules
    self.filters = filters

  def parseFromString(self, string):
    context = Context(self.rules, string)
    for result in context.rules['main'].match(context):
      rootNode = result.nodes[0]
      ApplyFilters(rootNode, self.filters)
      return rootNode
    return None


class rr(object):
  _SYMBOLS = {
      # Matchers
      'CharExcept': CharExcept,
      'EndOfLine': EndOfLine,
      'EndOfText': EndOfText,
      'Hidden': Hidden,
      'Insert': Insert,
      'Literal': Literal,
      'Node': Node,
      'Or': Or,
      'Ref': Ref,
      'SequentialPair': SequentialPair,
      'StartOfLine': StartOfLine,
      'ZeroOrMore': ZeroOrMore, 

      # Convenience factories
      'Char': Char,
      'MultiLineText': MultiLineText,
      'OneOrMore': OneOrMore,
      'Sequence': Sequence,
      'SingleLineText': SingleLineText,

      # Filter factories
      'ChildToAttribute': ChildToAttribute,
      'ExtractElement': ExtractElement,
      'GroupSiblings': GroupSiblings,
      'RenameElement': RenameElement,
      'SplitElementAndNest': SplitElementAndNest, 

      # Scaffolding
      'Parser': Parser,
  }

  def __getattr__(self, key):
    return self._SYMBOLS[key]
