var rr = {};


/* ============ typedefs ============ */


/**
 * @typedef {function(Node)}
 */
rr.typeFilter;


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



/* ============ Matchers (and their factories) ============ */



/**
 * @constructor
 *
 * @param {string} chars
 * @private
 */
rr.CharExcept_ = function(chars) {
  this.chars_ = chars;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
rr.CharExcept_.prototype.match = function(context) {
  var c = context.stringAfter(1);
  if (c && this.chars_.indexOf(c) == -1) {
    return rr.iterableFromArray_([{
      'context': context.advance(1),
      'nodes': [document.createTextNode(c)]
    }]);
  } else {
    return rr.iterableFromArray_([]);
  }
};


/**
 * @param {string} chars
 * @return {rr.CharExcept_}
 */
rr.CharExcept = function(chars) {
  return (rr.CharExcept.cache_[chars] ||
          (rr.CharExcept.cache_[chars] = new rr.CharExcept_(chars)));
};


/**
 * @type {Object.<string, rr.CharExcept_>}
 * @const
 * @private
 */
rr.CharExcept.cache_ = {};



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
  if (!rr.EndOfLine.cache_) {
    /**
      * @type {rr.EndOfLine_}
      * @const
      * @private
      */
    rr.EndOfLine.cache_ = new rr.EndOfLine_();
  }
  return rr.EndOfLine.cache_;
};



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
  if (!rr.EndOfText.cache_) {
    /**
     * @type {rr.EndOfText_}
     * @const
     * @private
     */
    rr.EndOfText.cache_ = new rr.EndOfText_();
  }
  return rr.EndOfText.cache_;
};



/**
 * @constructor
 *
 * @param {rr.typeMatcher} child
 * @private
 */
rr.Hidden_ = function(child) {
  this.child_ = child;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
rr.Hidden_.prototype.match = function(context) {
  var iterator = this.child_.match(context);
  return {
    'next': function() {
      var next = iterator.next();
      if (next['done']) {
        return { 'done': true };
      }
      return {
        'done': false,
        'value': {
          'context': next['value']['context'],
          'nodes': []
        }
      };
    }.bind(this)
  };
};


/**
 * @param {rr.typeMatcher} child
 * @return {rr.Hidden_}
 */
rr.Hidden = function(child) {
  return new rr.Hidden_(child);
};



/**
 * @constructor
 *
 * @param {string} value
 * @private
 */
rr.Insert_ = function(value) {
  this.value_ = value;
};


/**
 * @param {rr.Context} context
 * @return {rr.typeIterator}
 */
rr.Insert_.prototype.match = function(context) {
  return rr.iterableFromArray_([{
    'context': context,
    'nodes': [document.createTextNode(this.value_)]
  }]);
};


/**
 * @param {string} value
 * @return {rr.Insert_}
 */
rr.Insert = function(value) {
  return (rr.Insert.cache_[value] ||
          (rr.Insert.cache_[value] = new rr.Insert_(value)));
};


/**
 * @type {Object.<string, rr.Insert_>}
 * @const
 * @private
 */
rr.Insert.cache_ = {};



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
  return (rr.Literal.cache_[value] ||
          (rr.Literal.cache_[value] = new rr.Literal_(value)));
};


/**
 * @type {Object.<string, rr.Literal_>}
 * @const
 * @private
 */
rr.Literal.cache_ = {};



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
        node.appendChild(nodes[i].cloneNode(true));
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
  var optionIndex = 0;
  var lastIterator = null;
  return {
    'next': function() {
      while (true) {
        if (lastIterator) {
          var next = lastIterator.next();
          if (!next['done']) {
            return next;
          }
        }
        var option = this.options_[optionIndex++];
        if (!option) {
          return { 'done': true };
        }
        lastIterator = option.match(context);
      }
    }.bind(this)
  };
};


/**
 * @return {rr.Or_}
 */
rr.Or = function() {
  return new rr.Or_(Array.prototype.slice.call(arguments));
};



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
  return (rr.Ref.cache_[key] ||
          (rr.Ref.cache_[key] = new rr.Ref_(key)));
};


/**
 * @type {Object.<string, rr.Ref_>}
 * @const
 * @private
 */
rr.Ref.cache_ = {};



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
  if (!rr.StartOfLine.cache_) {
    /**
     * @type {rr.StartOfLine_}
     * @const
     * @private
     */
    rr.StartOfLine.cache_ = new rr.StartOfLine_();
  }
  return rr.StartOfLine.cache_;
};



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
  // 1) An empty result
  // 2) The results of SequentialPair(child, this)
  // 3) Done
  //
  // We must check for results from 2 that don't reduce context.remaining();
  // that means infinite recursion.

  var iterator = null;
  return {
    'next': function() {
      if (!iterator) {
        iterator = this.pair_.match(context);
        return {
          'done': false,
          'value': {
            'context': context,
            'nodes': []
          }
        };
      }
      var next = iterator.next();
      if (next['done']) {
        return { 'done': true };
      }
      if (next['value']['context'].remaining() == context.remaining()) {
        throw new Error(
            "Child of ZeroOrMore didn't consume input; grammar bug?");
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



/* ============ Convenience factories ============ */


/**
 * @return {rr.CharExcept_}
 */
rr.Char = function() {
  if (!rr.Char.cache_) {
    /**
     * @type {rr.CharExcept_}
     * @const
     * @private
     */
    rr.Char.cache_ = rr.CharExcept('');
  }
  return rr.Char.cache_;
};


/**
 * @return {rr.SequentialPair_}
 */
rr.MultiLineText = function() {
  if (!rr.MultiLineText.cache_) {
    /**
     * @type {rr.SequentialPair_}
     * @const
     * @private
     */
    rr.MultiLineText.cache_ = rr.OneOrMore(rr.Char());
  }
  return rr.MultiLineText.cache_;
};


/**
 * @param {rr.typeMatcher} child
 * @return {rr.SequentialPair_}
 */
rr.OneOrMore = function(child) {
  return rr.SequentialPair(child, rr.ZeroOrMore(child));
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
 * @return {rr.SequentialPair_}
 */
rr.SingleLineText = function() {
  if (!rr.SingleLineText.cache_) {
    /**
     * @type {rr.SequentialPair_}
     * @const
     * @private
     */
    rr.SingleLineText.cache_ = rr.OneOrMore(rr.CharExcept('\n'));
  }
  return rr.SingleLineText.cache_;
};



/* ============ Filter factories ============ */


/**
 * @param {string} parentName
 * @param {string} childNames
 * @return {rr.typeFilter}
 */
rr.GroupSiblings = function(parentName, childNames) {
  return function(node) {
    if (childNames.indexOf(node.nodeName.toLowerCase()) == -1) {
      return;
    }
    if (node.previousSibling &&
        node.previousSibling.nodeName.toLowerCase() == parentName) {
      // Group with previous node.
      node.previousSibling.appendChild(node);
      return;
    }
    var newNode = document.createElement(parentName);
    node.parentNode.replaceChild(newNode, node);
    newNode.appendChild(node);
  };
};


/**
 * @param {string} oldName
 * @param {string} newName
 * @return {rr.typeFilter}
 */
rr.RenameElement = function(oldName, newName) {
  return function(node) {
    if (node.nodeName.toLowerCase() != oldName) {
      return;
    }
    var newNode = document.createElement(newName);
    for (var i = 0; i < node.childNodes.length; i++) {
      newNode.appendChild(node.childNodes[i]);
    }
    node.parentNode.replaceChild(newNode, node);
  };
};


/**
 * @param {string} originalName
 * @param {Array.<string>} newNames
 * @return {rr.typeFilter}
 */
rr.SplitElementAndNest = function(originalName, newNames) {
  return function(node) {
    if (node.nodeName.toLowerCase() != originalName) {
      return;
    }
    var outerNode, innerNode;
    for (var i = 0; i < newNames.length; i++) {
      var newNode = document.createElement(newNames[i]);
      if (i == 0) {
        outerNode = innerNode = newNode;
      } else {
        innerNode.appendChild(newNode);
        innerNode = newNode;
      }
    }
    for (var i = 0; i < node.childNodes.length; i++) {
      innerNode.appendChild(node.childNodes[i]);
    }
    node.parentNode.replaceChild(outerNode, node);
  }
};



/* ============ Scaffolding ============ */


/**
 * @param {Node} node
 * @param {rr.typeFilter} filter
 */
rr.ApplyFilter = function(node, filter) {
  filter(node);
  var children = Array.prototype.slice.call(node.childNodes);
  for (var i = 0; i < children.length; i++) {
    rr.ApplyFilter(children[i], filter);
  }
};


/**
 * @param {Node} node
 * @param {Array.<rr.typeFilter>} filters
 */
rr.ApplyFilters = function(node, filters) {
  for (var i = 0; i < filters.length; i++) {
    rr.ApplyFilter(node, filters[i]);
  }
};



/**
 * @constructor
 *
 * @param {Object.<string, rr.typeMatcher>} rules
 * @param {string} input
 * @param {number=} opt_inputIndex
 */
rr.Context = function(rules, input, opt_inputIndex) {
  this.rules = rules;
  this.input = input;
  this.inputIndex = opt_inputIndex || 0;
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
  return this.input.slice(start, start + numChars);
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
    throw new Error('Context.advance(0) called');
  }
  var context = this.copy();
  context.inputIndex += numChars;
  return context;
};



/**
 * @constructor
 *
 * @param {Object.<string, rr.typeMatcher>} rules
 * @param {Array.<rr.typeFilter>} filters
 * @private
 */
rr.Parser_ = function(rules, filters) {
  this.rules_ = rules;
  this.filters_ = filters;
};


/**
 * @param {string} input
 * @return {?Node}
 */
rr.Parser_.prototype.parseFromString = function(input) {
  var context = new rr.Context(this.rules_, input);
  var iterable = context.rules['main'].match(context);
  var next = iterable.next();
  if (next['done']) {
    return null;
  }
  var rootNode = next['value']['nodes'][0];
  rr.ApplyFilters(rootNode, this.filters_);
  return rootNode;
};


/**
 * @param {Object.<string, rr.typeMatcher>} rules
 * @param {Array.<rr.typeFilter>} filters
 * @return {rr.Parser_}
 */
rr.Parser = function(rules, filters) {
  return new rr.Parser_(rules, filters);
};
