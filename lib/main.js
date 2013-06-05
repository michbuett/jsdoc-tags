#!/usr/bin/env node

// load the node.js libraries to be abstracted
var fs = require('fs');
var vm = require('vm');

// define a few globals to be compatible with jsrun.jar
global.arguments = global.internal_args || process.argv.slice(2);

/** @function */
load = function (file) {
    vm.runInThisContext(fs.readFileSync(file), file);
};

/** @function */
print = console.log;

/** @function */
quit = process.exit;

/** @namespace LOG */
LOG = require('./log.js').create();

/** @namespace FilePath */
FilePath = require('./filePath.js');

/** @namespace SYS */
SYS = require('./sys.js').create('/', __dirname + '/../support/jsdoc-toolkit/app/');

/** @namespace IO */
IO = require('./io.js').create();

// now run the application
IO.include('frame.js');
IO.include('lib/JSDOC.js');
IO.includeDir('plugins/');

// process the options
if (JSDOC.opt.c) {
    // the -c option: options are defined in a configuration file
    /* jshint evil: true */
    eval('JSDOC.conf = ' + IO.readFile(JSDOC.opt.c));
    /* jshint evil: false */

    LOG.inform('Using configuration file at "' + JSDOC.opt.c + '".');

    for (var c in JSDOC.conf) {
        if (c !== 'D' && !defined(JSDOC.opt[c])) { // commandline overrules config file
            JSDOC.opt[c] = JSDOC.conf[c];
        }
    }

    /* WTF???
    if (typeof JSDOC.conf['_'] != 'undefined') {
        JSDOC.opt.'_' = JSDOC.opt['_'].concat(JSDOC.conf['_']);
    }
    */

    LOG.inform('With configuration: ');
    for (var o in JSDOC.opt) {
        LOG.inform('    '+o+': '+JSDOC.opt[o]);
    }
}

// be verbose
if (JSDOC.opt.v) LOG.verbose = true;

// send log messages to a file
if (JSDOC.opt.o) LOG.out = IO.open(JSDOC.opt.o);

// run the unit tests
if (JSDOC.opt.T) {
    LOG.inform('JsDoc Toolkit running in test mode at '+new Date()+'.');
    IO.include('frame/Testrun.js');
    IO.include('test.js');
} else {
    // a template must be defined and must be a directory path
    if (!JSDOC.opt.t && process.env.JSDOCTEMPLATEDIR) {
        JSDOC.opt.t = process.env.JSDOCTEMPLATEDIR;
    }
    if (JSDOC.opt.t && SYS.slash != JSDOC.opt.t.slice(-1)) {
        JSDOC.opt.t += SYS.slash;
    }

    // verbose messages about the options we were given
    LOG.inform('JsDoc Toolkit main() running at '+new Date()+'.');
    LOG.inform('With options: ');
    for (var o in JSDOC.opt) {
        LOG.inform('    '+o+': '+JSDOC.opt[o]);
    }

    // initialize and build a symbolSet from your code
    JSDOC.JsDoc();

    // debugger's option: dump the entire symbolSet produced from your code
    if (JSDOC.opt.Z) {
        LOG.warn('So you want to see the data structure, eh? This might hang if you have circular refs...');
        IO.include('frame/Dumper.js');
        var symbols = JSDOC.JsDoc.symbolSet.toArray();
        for (var i = 0, l = symbols.length; i < l; i++) {
            var symbol = symbols[i];
            print('// symbol: ' + symbol.alias);
            print(symbol.serialize());
        }
    } else {
        JSDOC.opt.t = JSDOC.opt.t || SYS.pwd + '/../../../templates/tags/';
        try {
            // a file named 'publish.js' must exist in the template directory
            load(JSDOC.opt.t + 'publish.js');

            // and must define a function named 'publish'
            if (!publish) {
                LOG.warn('No publish() function is defined in that template so nothing to do.');
            } else {
                // which will be called with the symbolSet produced from your code
                publish(JSDOC.JsDoc.symbolSet);
            }
        }
        catch (e) {
            LOG.warn('Sorry, that doesn\'t seem to be a valid template: ' + JSDOC.opt.t + 'publish.js : ' + e);
        }
    }
}

// notify of any warnings
if (!JSDOC.opt.q && LOG.warnings.length) {
    print(LOG.warnings.length+' warning'+(LOG.warnings.length != 1? 's':'')+'.');
}

// stop sending log messages to a file
if (LOG.out) {
    LOG.out.flush();
    LOG.out.close();
}
