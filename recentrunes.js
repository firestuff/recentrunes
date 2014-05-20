var rr = {};

rr.Literal_ = function(value) {
};

rr.Literal = function(value) {
  return (rr.Literal.cache[value] ||
          (rr.Literal.cache[value] = new rr.Literal_(value)));
};
rr.Literal.cache = {};


rr.Ref_ = function(key) {
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

rr.MultiLineText = function() {
  return rr.MultiLineText.cache;
};
rr.MultiLineText.cache = new rr.MultiLineText_();


rr.Or_ = function(options) {
};

rr.Or = function() {
  return new rr.Or_(arguments);
};


rr.SingleLineText_ = function() {
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

rr.WordText = function() {
  return rr.WordText.cache;
};
rr.WordText.cache = new rr.WordText_();


rr.ZeroOrMore_ = function(key) {
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
};
