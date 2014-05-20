var rr = {};



rr.Literal_ = function(value) {
  this.value_ = value;
};

rr.Literal_.prototype.match = function(input) {
  if (input.slice(0, this.value_.length) == this.value_) {
    return [this.value_.length, null];
  } else {
    return null;
  }
};

rr.Literal_.prototype.search = function(input) {
  var index = input.indexOf(this.value_);
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

rr.Ref_.prototype.match = function(input, fullInput, inputIndex, parser) {
  return parser.parse(this.key_, input);
};

rr.Ref = function(key) {
  return (rr.Ref.cache[key] ||
          (rr.Ref.cache[key] = new rr.Ref_(key)));
};
rr.Ref.cache = {};



rr.EndOfLine_ = function() {
};

rr.EndOfLine_.prototype.match = function(input, fullInput, inputIndex) {
  if (input.length == 0) {
    return [0, null];
  }
  if (input[0] == '\n') {
    return [1, null];
  }
  if (inputIndex > 0 && fullInput[inputIndex - 1] == '\n') {
    return [0, null];
  }
  return null;
};

rr.EndOfLine_.prototype.search = function(input, fullInput, inputIndex) {
  if (input.length == 0) {
    return 0;
  }
  var loc = input.indexOf('\n');
  if (loc == -1) {
    return input.length;
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

rr.EndOfText_.prototype.match = function(input) {
  if (input.length) {
    return null;
  } else {
    return [0, null];
  }
};

rr.EndOfText_.prototype.search = function(input) {
  return input.length;
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

rr.MultiLineText_.prototype.match = function(input) {
  return [input.length, document.createTextNode(input)];
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
    };
  }
  return false;
};

rr.Or_.prototype.match = function(input, fullInput, inputIndex, parser) {
  for (var i = 0; i < this.options_.length; i++) {
    var option = this.options_[i];
    var result = parser.parse(option, input);
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

rr.SingleLineText_.prototype.match = function(input) {
  var newLine = input.indexOf('\n');
  if (newLine == -1) {
    return [input.length, document.createTextNode(input)];
  } else {
    return [newLine, document.createTextNode(input.slice(0, newLine))];
  }
};

rr.SingleLineText = function() {
  return rr.SingleLineText.cache;
};
rr.SingleLineText.cache = new rr.SingleLineText_();



rr.StartOfLine_ = function() {
};

rr.StartOfLine_.prototype.match = function(input, fullInput, inputIndex) {
  if (inputIndex == 0) {
    return [0, null];
  }
  if (input[0] == '\n') {
    return [1, null];
  }
  if (fullInput[inputIndex - 1] == '\n') {
    return [0, null];
  }
  return null;
};

rr.StartOfLine_.prototype.search = function(input, fullInput, inputIndex) {
  if (inputIndex == 0) {
    return 0;
  }
  var loc = input.indexOf('\n');
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

rr.ZeroOrMore_.prototype.match = function(input, fullInput, inputIndex, parser) {
  var ret = document.createElement('group');
  var parseIndex = 0;
  while (parseIndex < input.length - 1) {
    var result = parser.parse(this.key_, input.slice(parseIndex));
    if (!result) {
      break;
    }
    parseIndex += result[0];
    if (result[1]) {
      ret.appendChild(result[1]);
    }
  };
  return [parseIndex, ret];
};

rr.ZeroOrMore = function(key) {
  return (rr.ZeroOrMore.cache[key] ||
          (rr.ZeroOrMore.cache[key] = new rr.ZeroOrMore_(key)));
};
rr.ZeroOrMore.cache = {};



var RecentRunes = function(dictionary) {
  this.dictionary_ = dictionary;
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

RecentRunes.prototype.parse = function(nodeType, input) {
  var ret = document.createElement(nodeType);
  var rules = this.dictionary_[nodeType];
  var inputIndex = 0;
  var lastRuleMinimize = false;
  for (var i = 0; i < rules.length; i++) {
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
      var loc = rule.search(input.slice(inputIndex));
      if (loc == null) {
        return null;
      }

      // Check if the previous rule will match the interim data
      var prevMatch = lastRuleMinimize.match(
          input.slice(inputIndex, inputIndex + loc),
          input, inputIndex, this);
      if (!prevMatch || prevMatch[0] != loc) {
        return null;
      };
      inputIndex += prevMatch[0];
      if (prevMatch[1]) {
        ret.appendChild(prevMatch[1]);
      }

      lastRuleMinimize = false;
    }
    var match = rule.match(
        input.slice(inputIndex), input, inputIndex, this);
    if (!match) {
      return null;
    }
    inputIndex += match[0];
    if (match[1]) {
      ret.appendChild(match[1]);
    }
  };

  if (lastRuleMinimize) {
    var lastMatch = lastRuleMinimize.match(
        input.slice(inputIndex), input, inputIndex, this);
    if (!lastMatch || lastMatch[0] != input.length - inputIndex) {
      return null;
    }
    inputIndex += lastMatch[0];
    if (lastMatch[1]) {
      ret.appendChild(lastMatch[1]);
    }
  }

  return [inputIndex, ret];
};
