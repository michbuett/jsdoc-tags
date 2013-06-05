/**
 * @class Sys
 * A collection of information about your system.
 */
var Sys = function (slash, root) {

    /**
     * Which way does your slash lean.
     *
     * @property slash
     * @type {String}
     */
    this.slash = slash;


    /**
     * The absolute path to the directory containing this script.
     *
     * @property pwd
     * @type {String}
     */
    this.pwd = (root || '').replace(/\//g, slash);
};

module.exports = {
    create: function (slash, root) {
        return new Sys(slash, root);
    }
};

