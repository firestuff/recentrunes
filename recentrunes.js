var rr = {};


/**
 * @typedef {{done: boolean,
 *            value: *}}
 */
rr.typeIteratorResult;


/**
 * @typedef {{next: function(): rr.typeIteratorResult}}
 */
rr.typeIterator;


/**
 * @typedef {Object}
 */
rr.typeMatcher;


/**
 * @param {Array.<*>} arr
 * @return {rr.typeIterator}
 * @private
 */
rr.iterableFromArray_ = function(arr) {
  var i = 0;
  return {
    'next': function() {
      if (i < arr.length) {
        return { 'done': false, 'value': arr[i++] };
      } else {
        return { 'done': true };
      }
    }
  };
};



/**
 * @constructor
 *
 * @param {string} value
 * @private
 */
rr.Literal_ = function(value) {
  this.value_ = value;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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


/**
 * @param {string} value
 * @return {rr.Literal_}
 */
rr.Literal = function(value) {
  return (rr.Literal.cache[value] ||
          (rr.Literal.cache[value] = new rr.Literal_(value)));
};


/**
 * @type {Object.<string, rr.Literal_>}
 * @const
 */
rr.Literal.cache = {};



/**
 * @constructor
 *
 * @param {string} key
 * @private
 */
rr.Ref_ = function(key) {
  this.key_ = key;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
rr.Ref_.prototype.match = function(context) {
  return context.rules[this.key_].match(context);
};


/**
 * @param {string} key
 * @return {rr.Ref_}
 */
rr.Ref = function(key) {
  return (rr.Ref.cache[key] ||
          (rr.Ref.cache[key] = new rr.Ref_(key)));
};


/**
 * @type {Object.<string, rr.Ref_>}
 * @const
 */
rr.Ref.cache = {};



/**
 * @constructor
 *
 * @param {string} name
 * @param {rr.typeMatcher} child
 * @private
 */
rr.Node_ = function(name, child) {
  this.name_ = name;
  this.child_ = child;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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
      };
    }.bind(this)
  };
};


/**
 * @param {string} name
 * @param {rr.typeMatcher} child
 * @return {rr.Node_}
 */
rr.Node = function(name, child) {
  return new rr.Node_(name, child);
};



/**
 * @constructor
 *
 * @private
 */
rr.EndOfLine_ = function() {
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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
  }
  if (context.stringBefore(1) == '\n') {
    return rr.iterableFromArray_([{
      'context': context,
      'nodes': []
    }]);
  }
  return rr.iterableFromArray_([]);
};


/**
 * @return {rr.EndOfLine_}
 */
rr.EndOfLine = function() {
  return rr.EndOfLine.cache;
};


/**
 * @type {rr.EndOfLine_}
 * @const
 */
rr.EndOfLine.cache = new rr.EndOfLine_();



/**
 * @constructor
 *
 * @private
 */
rr.EndOfText_ = function() {
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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


/**
 * @return {rr.EndOfText_}
 */
rr.EndOfText = function() {
  return rr.EndOfText.cache;
};


/**
 * @type {rr.EndOfText_}
 * @const
 */
rr.EndOfText.cache = new rr.EndOfText_();



/**
 * @constructor
 *
 * @private
 */
rr.MultiLineText_ = function() {
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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
  };
};


/**
 * @return {rr.MultiLineText_}
 */
rr.MultiLineText = function() {
  return rr.MultiLineText.cache;
};


/**
 * @type {rr.MultiLineText_}
 * @const
 */
rr.MultiLineText.cache = new rr.MultiLineText_();



/**
 * @constructor
 *
 * @param {Array.<rr.typeMatcher>} options
 * @private
 */
rr.Or_ = function(options) {
  this.options_ = options;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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
  };
};


/**
 * @return {rr.Or_}
 */
rr.Or = function() {
  return new rr.Or_(Array.prototype.slice.call(arguments, 0));
};



/**
 * @constructor
 *
 * @private
 */
rr.SingleLineText_ = function() {
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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
  };
};


/**
 * @return {rr.SingleLineText_}
 */
rr.SingleLineText = function() {
  return rr.SingleLineText.cache;
};


/**
 * @type {rr.SingleLineText_}
 * @const
 */
rr.SingleLineText.cache = new rr.SingleLineText_();



/**
 * @constructor
 *
 * @private
 */
rr.StartOfLine_ = function() {
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
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


/**
 * @return {rr.StartOfLine_}
 */
rr.StartOfLine = function() {
  return rr.StartOfLine.cache;
};


/**
 * @type {rr.StartOfLine_}
 * @const
 */
rr.StartOfLine.cache = new rr.StartOfLine_();



/**
 * @constructor
 *
 * @param {rr.typeMatcher} child
 * @private
 */
rr.ZeroOrMore_ = function(child) {
  this.pair_ = rr.SequentialPair(child, this);
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
rr.ZeroOrMore_.prototype.match = function(context) {
  // Yield:
  // 1) The results of SequentialPair(child, this)
  // 2) An empty result
  // 3) Done
  //
  // We must check for results from 1 that don't reduce context.remaining();
  // that means infinite recursion.

  var iterator = this.pair_.match(context);
  return {
    'next': function() {
      if (!iterator) {
        return { 'done': true };
      }
      var next = iterator.next();
      if (next['done']) {
        iterator = null;
        return {
          'done': false,
          'value': {
            'context': context,
            'nodes': []
          }
        };
      }
      if (next['value']['context'].remaining() == context.remaining()) {
        throw "Child of ZeroOrMore didn't consume input; grammar bug?";
      }
      return next;
    }.bind(this)
  };
};


/**
 * @param {rr.typeMatcher} child
 * @return {rr.ZeroOrMore_}
 */
rr.ZeroOrMore = function(child) {
  return new rr.ZeroOrMore_(child);
};



/**
 * @constructor
 *
 * @param {rr.typeMatcher} child1
 * @param {rr.typeMatcher} child2
 * @private
 */
rr.SequentialPair_ = function(child1, child2) {
  this.child1_ = child1;
  this.child2_ = child2;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
rr.SequentialPair_.prototype.match = function(context) {
  var child1Iterator = this.child1_.match(context);
  var child1Value = null;
  var child2Iterator = null;
  return {
    'next': function() {
      while (true) {
        if (!child1Value) {
          child1Value = child1Iterator.next();
          if (child1Value['done']) {
            return { 'done': true };
          }
          child2Iterator = null;
        }
        if (!child2Iterator) {
          child2Iterator = this.child2_.match(
              child1Value['value']['context']);
        }
        var child2Value = child2Iterator.next();
        if (child2Value['done']) {
          child1Value = null;
          continue;
        }
        return {
          'done': false,
          'value': {
            'context': child2Value['value']['context'],
            'nodes': child1Value['value']['nodes'].concat(
                child2Value['value']['nodes'])
          }
        };
      }
    }.bind(this)
  };
};


/**
 * @param {rr.typeMatcher} child1
 * @param {rr.typeMatcher} child2
 * @return {rr.SequentialPair_}
 */
rr.SequentialPair = function(child1, child2) {
  return new rr.SequentialPair_(child1, child2);
};


/**
 * @return {rr.SequentialPair_|rr.typeMatcher}
 */
rr.Sequence = function() {
  var children = Array.prototype.slice.call(arguments);
  if (children.length == 1) {
    return children[0];
  }
  return rr.SequentialPair(
      children[0],
      rr.Sequence.apply(null, children.slice(1)));
};



/**
 * @constructor
 *
 * @param {Object.<string, rr.typeMatcher>} rules
 * @param {string} input
 * @param {number} inputIndex
 */
rr.Context = function(rules, input, inputIndex) {
  this.rules = rules;
  this.input = input;
  this.inputIndex = inputIndex || 0;
};


/**
 * @return {rr.Context}
 */
rr.Context.prototype.copy = function() {
  return new rr.Context(this.rules, this.input, this.inputIndex);
};


/**
 * @param {number} numChars
 * @return {string}
 */
rr.Context.prototype.stringAfter = function(numChars) {
  if (numChars == null) {
    numChars = this.remaining();
  }
  return this.input.slice(this.inputIndex, this.inputIndex + numChars);
};


/**
 * @param {number} numChars
 * @return {string}
 */
rr.Context.prototype.stringBefore = function(numChars) {
  var start = this.inputIndex - numChars;
  if (start < 0) {
    numChars += start;
    start = 0;
  }
  return this.input.slice(start, numChars);
};


/**
 * @return {boolean}
 */
rr.Context.prototype.atStart = function() {
  return this.inputIndex == 0;
};


/**
 * @return {boolean}
 */
rr.Context.prototype.atEnd = function() {
  return this.inputIndex == this.input.length;
};


/**
 * @return {number}
 */
rr.Context.prototype.remaining = function() {
  return this.input.length - this.inputIndex;
};


/**
 * @param {number} numChars
 * @return {rr.Context}
 */
rr.Context.prototype.advance = function(numChars) {
  if (!numChars) {
    throw "Context.advance(0) called";
  }
  var context = this.copy();
  context.inputIndex += numChars;
  return context;
};
