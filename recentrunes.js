var rr = {};


rr.iterableFromArray_ = function(arr) {
  var i = 0;
  return {
    'next': function() {
      if (i < arr.length) {
        return { 'done': false, 'value': arr[i++] };
      } else {
        return { 'done': true };
      }
    }.bind(this)
  }
};


rr.Literal_ = function(value) {
  this.value_ = value;
};

rr.Literal_.prototype.match = function(context) {
  if (context.stringAfter(this.value_.length) == this.value_) {
    return rr.iterableFromArray_([{
      'context': context.advance(this.value_.length),
      'nodes': []
    }]);
  } else {
    return rr.iterableFromArray_([]);
  }
};

rr.Literal = function(value) {
  return (rr.Literal.cache[value] ||
          (rr.Literal.cache[value] = new rr.Literal_(value)));
};
rr.Literal.cache = {};



rr.Ref_ = function(key) {
  this.key_ = key;
};

rr.Ref_.prototype.match = function(context) {
  return context.rules[this.key_].match(context);
};

rr.Ref = function(key) {
  return (rr.Ref.cache[key] ||
          (rr.Ref.cache[key] = new rr.Ref_(key)));
};
rr.Ref.cache = {};



rr.Node_ = function(name, child) {
  this.name_ = name;
  this.child_ = child;
};

rr.Node_.prototype.match = function(context) {
  var iterator = this.child_.match(context);
  return {
    'next': function() {
      var next = iterator.next();
      if (next['done']) {
        return { 'done': true };
      }
      var node = document.createElement(this.name_);
      var nodes = next['value']['nodes'];
      for (var i = 0; i < nodes.length; i++) {
        node.appendChild(nodes[i]);
      }
      node.normalize();
      return {
        'done': false,
        'value': {
          'context': next['value']['context'],
          'nodes': [node]
        }
      }
    }.bind(this)
  }
};

rr.Node = function(name, child) {
  return new rr.Node_(name, child);
};



rr.EndOfLine_ = function() {
};

rr.EndOfLine_.prototype.match = function(context) {
  if (context.atEnd()) {
    return rr.iterableFromArray_([{
      'context': context,
      'nodes': []
    }]);
  }
  if (context.stringAfter(1) == '\n') {
    return rr.iterableFromArray_([{
      'context': context.advance(1),
      'nodes': []
    }]);
    return [];
  }
  if (context.stringBefore(1) == '\n') {
    return rr.iterableFromArray_([{
      'context': context,
      'nodes': []
    }]);
  }
  return rr.iterableFromArray_([]);
};

rr.EndOfLine = function() {
  return rr.EndOfLine.cache;
};
rr.EndOfLine.cache = new rr.EndOfLine_();



rr.EndOfText_ = function() {
};

rr.EndOfText_.prototype.match = function(context) {
  if (context.atEnd()) {
    return rr.iterableFromArray_([{
      'context': context,
      'nodes': []
    }]);
  } else {
    return rr.iterableFromArray_([]);
  }
};

rr.EndOfText = function() {
  return rr.EndOfText.cache;
};
rr.EndOfText.cache = new rr.EndOfText_();



rr.MultiLineText_ = function() {
};

rr.MultiLineText_.prototype.match = function(context) {
  var i = 1;
  return {
    'next': function() {
      if (i <= context.remaining()) {
        var newNode = document.createTextNode(context.stringAfter(i));
        var ret = {
          'done': false,
          'value': {
            'nodes': [newNode],
            'context': context.advance(i)
          }
        };
        i++;
        return ret;
      } else {
        return { 'done': true };
      }
    }.bind(this)
  }
};

rr.MultiLineText = function() {
  return rr.MultiLineText.cache;
};
rr.MultiLineText.cache = new rr.MultiLineText_();



rr.Or_ = function(options) {
  this.options_ = options;
};

rr.Or_.prototype.match = function(context) {
  var i = 0;
  var lastIterator = null;
  return {
    'next': function() {
      if (lastIterator) {
        var next = lastIterator.next();
        if (!next['done']) {
          return next;
        }
      }
      for (; i < this.options_.length; i++) {
        var option = this.options_[i];
        lastIterator = option.match(context);
        var next = lastIterator.next();
        if (next['done']) {
          continue;
        } else {
          return next;
        }
      }
      return { 'done': true };
    }.bind(this)
  }
};

rr.Or = function() {
  return new rr.Or_(arguments);
};



rr.SingleLineText_ = function() {
};

rr.SingleLineText_.prototype.match = function(context) {
  var i = 1;
  return {
    'next': function() {
      if (i <= context.remaining()) {
        var newString = context.stringAfter(i);
        if (newString.indexOf('\n') != -1) {
          return { 'done': true };
        }
        var newNode = document.createTextNode(newString);
        var ret = {
          'done': false,
          'value': {
            'nodes': [newNode],
            'context': context.advance(i)
          }
        };
        i++;
        return ret;
      } else {
        return {'done': true };
      }
    }.bind(this)
  }
};

rr.SingleLineText = function() {
  return rr.SingleLineText.cache;
};
rr.SingleLineText.cache = new rr.SingleLineText_();



rr.StartOfLine_ = function() {
};

rr.StartOfLine_.prototype.match = function(context) {
  if (context.atStart()) {
    return rr.iterableFromArray_([{
      'context': context,
      'nodes': []
    }]);
  }
  if (context.stringAfter(1) == '\n') {
    return rr.iterableFromArray_([{
      'context': context.advance(1),
      'nodes': []
    }]);
  }
  if (context.stringBefore(1) == '\n') {
    return rr.iterableFromArray_([{
      'context': context,
      'nodes': []
    }]);
  }
  return rr.iterableFromArray_([]);
};

rr.StartOfLine = function() {
  return rr.StartOfLine.cache;
};
rr.StartOfLine.cache = new rr.StartOfLine_();



rr.ZeroOrMore_ = function(child) {
  this.child_ = child;
};

rr.ZeroOrMore_.prototype.match = function(context) {
  var nodes = [];
  while (!context.atEnd()) {
    var next = this.child_.match(context).next();
    if (next['done']) {
      break;
    }
    context = next['value']['context'];
    Array.prototype.push.apply(nodes, next['value']['nodes']);
  }
  return rr.iterableFromArray_([{
    'context': context,
    'nodes': nodes
  }]);
};

rr.ZeroOrMore = function(child) {
  return new rr.ZeroOrMore_(child);
};



rr.Sequence_ = function(children) {
  this.child_ = children[0];
  if (children.length > 1) {
    this.next_ = rr.Sequence.apply(null, children.slice(1));
  } else {
    this.next_ = null;
  }
};

rr.Sequence_.prototype.match = function(context) {
  var childIterator = this.child_.match(context);
  if (!this.next_) {
    return childIterator;
  }
  var currentChildValue = null;
  var nextIterator = null;
  return {
    'next': function() {
      while (true) {
        if (!currentChildValue) {
          currentChildValue = childIterator.next();
          if (currentChildValue['done']) {
            return { 'done': true };
          }
          nextIterator = null;
        }
        if (!nextIterator) {
          nextIterator = this.next_.match(currentChildValue['value']['context']);
        }
        var nextAppendValue = nextIterator.next();
        if (nextAppendValue['done']) {
          currentChildValue = null;
          continue;
        }
        return {
          'done': false,
          'value': {
            'context': nextAppendValue['value']['context'],
            'nodes': currentChildValue['value']['nodes'].concat(
                nextAppendValue['value']['nodes'])
          }
        }
      }
    }.bind(this)
  }
};

rr.Sequence = function() {
  return new rr.Sequence_(Array.prototype.slice.call(arguments));
};



rr.Context = function(rules, input, inputIndex) {
  this.rules = rules;
  this.input = input;
  this.inputIndex = inputIndex || 0;
};

rr.Context.prototype.copy = function() {
  return new rr.Context(this.rules, this.input, this.inputIndex);
};

rr.Context.prototype.stringAfter = function(numChars) {
  if (numChars == null) {
    numChars = this.remaining();
  }
  return this.input.slice(this.inputIndex, this.inputIndex + numChars);
};

rr.Context.prototype.stringBefore = function(numChars) {
  var start = this.inputIndex - numChars;
  if (start < 0) {
    numChars += start;
    start = 0;
  }
  return this.input.slice(start, numChars);
};

rr.Context.prototype.atStart = function() {
  return this.inputIndex == 0;
};

rr.Context.prototype.atEnd = function() {
  return this.inputIndex == this.input.length;
};

rr.Context.prototype.remaining = function() {
  return this.input.length - this.inputIndex;
};

rr.Context.prototype.advance = function(numChars) {
  var context = this.copy();
  context.inputIndex += numChars;
  return context;
};
