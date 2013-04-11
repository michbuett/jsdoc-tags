if (typeof JSDOC == "undefined") JSDOC = {};

/**
  @constructor
  */
JSDOC.Token = function(data, type, name, line) {
    this.data = data;
    this.type = type;
    this.name = name;
    this.line = line;
};

JSDOC.Token.prototype.toString = function() {
    return "<"+this.type+" name=\""+this.name+"\">"+this.data+"</"+this.type+">";
};

JSDOC.Token.prototype.is = function(what) {
    return this.name === what || this.type === what;
};
