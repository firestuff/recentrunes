var rr = {};



rr.Literal_ = function(value) {
  this.value_ = value;
};

rr.Literal_.prototype.match = function(context) {
  if (context.stringAfter(this.value_.length) == this.value_) {
    context.advance(this.value_.length);
    return [];
  } else {
    return null;
  }
};

rr.Literal_.prototype.search = function(context) {
  console.log(context.stringAfter());
  var index = context.stringAfter().indexOf(this.value_);
  if (index == -1) {
    return null;
  } else {
    return index;
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

rr.Ref_.prototype.minimize = function(parser) {
  return parser.minimize(this.key_);
};

rr.Ref_.prototype.match = function(context) {
  return context.parser.parse(this.key_, context);
};

rr.Ref = function(key) {
  return (rr.Ref.cache[key] ||
          (rr.Ref.cache[key] = new rr.Ref_(key)));
};
rr.Ref.cache = {};



rr.EndOfLine_ = function() {
};

rr.EndOfLine_.prototype.match = function(context) {
  if (context.atEnd()) {
    return [];
  }
  if (context.stringAfter(1) == '\n') {
    context.advance(1);
    return [];
  }
  if (context.stringBefore(1) == '\n') {
    return [];
  }
  return null;
};

rr.EndOfLine_.prototype.search = function(context) {
  if (context.atEnd()) {
    return 0;
  }
  var loc = context.stringAfter().indexOf('\n');
  if (loc == -1) {
    return context.remaining();
  } else {
    return loc;
  }
};

rr.EndOfLine = function() {
  return rr.EndOfLine.cache;
};
rr.EndOfLine.cache = new rr.EndOfLine_();



rr.EndOfText_ = function() {
};

rr.EndOfText_.prototype.match = function(context) {
  if (context.atEnd()) {
    return null;
  } else {
    return [];
  }
};

rr.EndOfText_.prototype.search = function(context) {
  return context.remaining();
};

rr.EndOfText = function() {
  return rr.EndOfText.cache;
};
rr.EndOfText.cache = new rr.EndOfText_();



rr.MultiLineText_ = function() {
};

rr.MultiLineText_.prototype.minimize = function() {
  return true;
};

rr.MultiLineText_.prototype.match = function(context) {
  var ret = [document.createTextNode(context.stringAfter())];
  context.advance(context.remaining());
  return ret;
};

rr.MultiLineText = function() {
  return rr.MultiLineText.cache;
};
rr.MultiLineText.cache = new rr.MultiLineText_();



rr.Or_ = function(options) {
  this.options_ = options;
};

rr.Or_.prototype.minimize = function(parser) {
  for (var i = 0; i < this.options_.length; i++) {
    var option = this.options_[i];
    if (parser.minimize(option)) {
      return true;
    }
  }
  return false;
};

rr.Or_.prototype.match = function(context) {
  for (var i = 0; i < this.options_.length; i++) {
    var option = this.options_[i];
    var result = context.parser.parse(option, context);
    if (result) {
      return result;
    }
  }
  return null;
};

rr.Or = function() {
  return new rr.Or_(arguments);
};



rr.SingleLineText_ = function() {
};

rr.SingleLineText_.prototype.minimize = function() {
  return true;
}

rr.SingleLineText_.prototype.match = function(context) {
  var newLine = context.stringAfter().indexOf('\n');
  if (newLine == -1) {
    newLine = context.remaining();
  }
  var ret = [document.createTextNode(context.stringAfter(newLine))];
  context.advance(newLine);
  return ret;
};

rr.SingleLineText = function() {
  return rr.SingleLineText.cache;
};
rr.SingleLineText.cache = new rr.SingleLineText_();



rr.StartOfLine_ = function() {
};

rr.StartOfLine_.prototype.match = function(context) {
  if (context.atStart()) {
    return [];
  }
  if (context.stringAfter(1) == '\n') {
    context.advance(1);
    return [];
  }
  if (context.stringBefore(1) == '\n') {
    return [];
  }
  return null;
};

rr.StartOfLine_.prototype.search = function(context) {
  if (context.atStart()) {
    return 0;
  }
  var loc = context.stringAfter().indexOf('\n');
  if (loc == -1) {
    return null;
  }
  return loc + 1;
};

rr.StartOfLine = function() {
  return rr.StartOfLine.cache;
};
rr.StartOfLine.cache = new rr.StartOfLine_();



rr.ZeroOrMore_ = function(key) {
  this.key_ = key;
};

rr.ZeroOrMore_.prototype.minimize = function(parser) {
  return parser.minimize(this.key_);
};

rr.ZeroOrMore_.prototype.match = function(context) {
  var ret = [];
  while (context.inputIndex < context.input.length) {
    var result = context.parser.parse(this.key_, context);
    if (!result) {
      break;
    }
    result.forEach(function(child) {
      ret.push(child);
    });
  };
  return ret;
};

rr.ZeroOrMore = function(key) {
  return (rr.ZeroOrMore.cache[key] ||
          (rr.ZeroOrMore.cache[key] = new rr.ZeroOrMore_(key)));
};
rr.ZeroOrMore.cache = {};


rr.Context = function(parser, input, inputIndex) {
  this.parser = parser;
  this.input = input;
  this.inputIndex = inputIndex || 0;
};

rr.Context.prototype.copy = function() {
  return new rr.Context(this.parser, this.input, this.inputIndex);
};

rr.Context.prototype.truncate = function(numChars) {
  this.input = this.input.slice(this.inputIndex, this.inputIndex + numChars);
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
  console.log('advance', numChars);
  this.inputIndex += numChars;
};


var RecentRunes = function(dictionary) {
  this.dictionary_ = dictionary;
};

RecentRunes.prototype.parseString = function(nodeType, input) {
  var context = new rr.Context(this, input);
  var ret = this.parse(nodeType, context);
  if (ret) {
    return ret[0];
  } else {
    return null;
  }
};

RecentRunes.prototype.minimize = function(nodeType) {
  var rules = this.dictionary_[nodeType];
  for (var i = 0; i < rules.length; i++) {
    if (rules.minimize && rules.minimize(this)) {
      return true;
    }
  }
  return false;
};

RecentRunes.prototype.parse = function(nodeType, origContext) {
  var context = origContext.copy();
  var ret = document.createElement(nodeType);
  var rules = this.dictionary_[nodeType];
  rules = [];
  var lastRuleMinimize = false;
  for (var i = 0; i < rules.length; i++) {
    console.log('nodeType:', nodeType, 'rule:', i);
    var rule = rules[i];
    if (rule.minimize && rule.minimize(this)) {
      if (lastRuleMinimize) {
        // Two minimize rules in a row is ambiguous
        return null;
      }
      lastRuleMinimize = rule;
      continue;
    }
    if (lastRuleMinimize) {
      // Check if this rule can find a match in the string
      var loc = rule.search(context);
      if (loc == null) {
        console.log('search fail');
        return null;
      }

      // Check if the previous rule will match the interim data
      var prevContext = context.copy();
      prevContext.truncate(loc);
      var prevMatch = lastRuleMinimize.match(prevContext);
      if (!prevMatch) {
        console.log('prevMatch fail');
        return null;
      };
      context.advance(prevContext.inputIndex - context.inputIndex);
      prevMatch.forEach(function(child) {
        ret.appendChild(child);
      });

      lastRuleMinimize = false;
    }
    console.log(context);
    var match = rule.match(context);
    if (!match) {
      console.log('rule fail');
      return null;
    }
    match.forEach(function(child) {
      ret.appendChild(child);
    });
  };

  if (lastRuleMinimize) {
    var prevContext = context.copy();
    prevContext.truncate(loc);
    var lastMatch = lastRuleMinimize.match(prevContext);
    if (!lastMatch) {
      return null;
    }
    context.advance(prevContext.inputIndex - context.inputIndex);
    lastMatch.forEach(function(child) {
      ret.appendChild(child);
    });
  }

  console.log('nodeType:', nodeType, 'context:', context);

  origContext.advance(context.inputIndex - origContext.inputIndex);

  return [ret];
};
