
var Log = function (cfg) {
    'use strict';

    this.warnings = [];
    this.verbose = !!cfg.verbose;
    this.out = cfg.out;
};

Log.prototype = {
    warn: function (msg, e) {
        'use strict';

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
        'use strict';

        if (JSDOC.opt.q) {
            return;
        }

        msg = " > " + msg;

        if (this.out) {
            this.out.write(msg + "\n");
        } else if (typeof this.verbose !== 'undefined' && this.verbose) {
            print(msg);
        }
    }
};

module.exports = {
    create: function (cfg) {
        'use strict';
        return new Log(cfg || {});
    }
};
