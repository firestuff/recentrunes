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

rr.Ref = function(key) {
  return (rr.Ref.cache[key] ||
          (rr.Ref.cache[key] = new rr.Ref_(key)));
};
rr.Ref.cache = {};


rr.EndOfLine_ = function() {
};

rr.EndOfLine = function() {
  return rr.EndOfLine.cache;
}
rr.EndOfLine.cache = new rr.EndOfLine_();


rr.MultiLineText_ = function() {
};

rr.MultiLineText_.prototype.minimize = true;

rr.MultiLineText = function() {
  return rr.MultiLineText.cache;
};
rr.MultiLineText.cache = new rr.MultiLineText_();


rr.Or_ = function(options) {
  this.options_ = options;
};

rr.Or = function() {
  return new rr.Or_(arguments);
};


rr.SingleLineText_ = function() {
};

rr.SingleLineText_.prototype.minimize = true;

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

rr.StartOfLine = function() {
  return rr.StartOfLine.cache;
};
rr.StartOfLine.cache = new rr.StartOfLine_();


rr.WordText_ = function() {
};

rr.WordText_.prototype.minimize = true;

rr.WordText = function() {
  return rr.WordText.cache;
};
rr.WordText.cache = new rr.WordText_();


rr.ZeroOrMore_ = function(key) {
  this.key_ = key;
};

rr.ZeroOrMore = function(key) {
  return (rr.ZeroOrMore.cache[key] ||
          (rr.ZeroOrMore.cache[key] = new rr.ZeroOrMore_(key)));
};
rr.ZeroOrMore.cache = {};


var RecentRunes = function(dictionary) {
  this.dictionary_ = dictionary;
};

RecentRunes.prototype.parse = function(nodeType, input) {
  var ret = document.createElement(nodeType);
  var rules = this.dictionary_[nodeType];
  var inputIndex = 0;
  var lastRuleMinimize = false;
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (rule.minimize) {
      if (lastRuleMinimize) {
        // Two minimize rules in a row is ambiguous
        return null;
      }
      lastRuleMinimize = true;
      continue;
    }
    if (lastRuleMinimize) {
      // Check if this rule can find a match in the string
      var loc = rule.search(input.slice(inputIndex));
      if (loc == null) {
        return null;
      }

      // Check if the previous rule will match the interim data
      var prevMatch = rules[i - 1].match(
          input.slice(inputIndex, inputIndex + loc));
      if (!prevMatch) {
        return null;
      };
      inputIndex += prevMatch[0];
      if (prevMatch[1]) {
        ret.appendChild(prevMatch[1]);
      }
    }
    var match = rule.match(input.slice(inputIndex));
    if (!match) {
      return null;
    }
    inputIndex += match[0];
    if (match[1]) {
      ret.appendChild(match[1]);
    }
  };
  return [inputIndex, ret];
};
