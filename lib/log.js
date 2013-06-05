
var Log = function () {
    this.warnings = [];
    this.verbose = false;
};

Log.prototype = {
    warn: function (msg, e) {
        if (JSDOC.opt.q) {
            return;
        }

        if (e) {
            msg = e.fileName + ", line " + e.lineNumber + ": " + msg;
        }

        msg = ">> WARNING: " + msg;
        this.warnings.push(msg);

        if (this.out) {
            this.out.write(msg + "\n");
        } else {
            print(msg);
        }
    },

    inform: function (msg) {
        if (JSDOC.opt.q) {
            return;
        }

        msg = " > "+msg;

        if (this.out) {
            this.out.write(msg+"\n");
        } else if (typeof this.verbose !== 'undefined' && this.verbose) {
            print(msg);
        }
    },

    out: undefined
};

module.exports = {
    create: function () {
        return new Log();
    }
};
