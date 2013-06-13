#!/usr/bin/env node

// load the node.js libraries to be abstracted
var fs = require('fs');
var vm = require('vm');
var program = require('../support/commander/');

program
    .version('0.1.0')
    .usage('node path/to/jsdoc-tags [options] <file> ...')
    .option('-a, --allfunctions', 'Include all functions, even undocumented ones.')
    .option('-d, --directory [PATH]', 'Output to this directory (print result to stdout if ommitted).')
    .option('-i, --incremental', 'Make incremental updates (only if supported by the template)')
    .option('-l, --log <file>', 'Save log and debug messages to file <file>')
    .option('-m, --multiples', 'Don\'t warn about symbols being documented more than once.')
    .option('-n, --nocode', 'Ignore all code, only document comments with @name tags.')
    .option('-p, --private', 'Include symbols tagged as private, underscored and inner symbols.')
    .option('-q, --quiet', 'No additional output (e.g. warnings, ...)')
    .option('-r, --recurse', 'Descend into src directories.')
    .option('-t, --template <tpl>', 'The path to the template (defauts to the tags template)', __dirname + '/../templates/tags')
    .option('-u, --unique', 'Force file names to be unique, but not based on symbol names.')
    .option('-v, --verbose', 'Provide verbose feedback about what is happening.')
    .parse(process.argv);

var files = program.args;

// initialize global namespaces and methods required by JsDoc
/** @function */
load = function (file) {
    'use strict';
    vm.runInThisContext(fs.readFileSync(file), file);
};

/** @function */
print = console.log;

/** @function */
quit = process.exit;

/** @namespace LOG */
LOG = require('./log.js').create({
    verbose: !!program.verbose, // be verbose
    out: !!program.log // send log messages to a file
});

/** @namespace FilePath */
FilePath = require('./filePath.js');

/** @namespace SYS */
SYS = require('./sys.js').create('/', __dirname + '/../support/jsdoc-toolkit/app/');

/** @namespace IO */
IO = require('./io.js').create();

/** @namespace JSDOC */
JSDOC = {
    // process the options
    opt: {
        a: program.allfunctions,
        d: program.directory,
        i: program.incremental,
        m: program.multiples,
        n: program.nocode,
        o: program.log,
        p: program.private,
        q: program.quiet,
        r: program.recurse ? 99 : 0,
        t: program.template,
        u: program.unique,
        v: program.verbose,
        _: files
    }
};

// now run the application
IO.include('frame.js');
IO.includeDir("lib/JSDOC/");
IO.includeDir('plugins/');

// a template must be defined and must be a directory path
if (JSDOC.opt.t && SYS.slash !== JSDOC.opt.t.slice(-1)) {
    JSDOC.opt.t += SYS.slash;
}

// verbose messages about the options we were given
LOG.inform('JsDoc Toolkit main() running at ' + new Date() + '.');
LOG.inform('With options: ');
for (var o in JSDOC.opt) {
    LOG.inform('    ' + o + ': ' + JSDOC.opt[o]);
}

// initialize and build a symbolSet from your code
JSDOC.JsDoc();

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
} catch (e) {
    LOG.warn('Sorry, that doesn\'t seem to be a valid template: ' + JSDOC.opt.t + 'publish.js : ' + e);
}

// notify of any warnings
if (!JSDOC.opt.q && LOG.warnings.length) {
    print(LOG.warnings.length + ' warning' + (LOG.warnings.length !== 1 ? 's' : '') + '.');
}

// stop sending log messages to a file
if (LOG.out) {
    LOG.out.flush();
    LOG.out.close();
}
