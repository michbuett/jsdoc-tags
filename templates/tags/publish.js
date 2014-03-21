/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
    'use strict';

    var conf = {  // trailing slash expected for dirs
        outDir: JSDOC.opt.d,
        templatesDir: JSDOC.opt.t || SYS.pwd + '../templates/tags/',
        incremental: JSDOC.opt.i,
        simple: JSDOC.opt.s,
    };

    if (conf.outDir) {
        // create the folders to hold the output
        IO.mkPath(conf.outDir);
    }

    var tagsData = [];
    var symbols = symbolSet.toArray(); // get an array version of the symbolset, useful for filtering
    var i, l;
    var files = {};

    for (i = 0, l = symbols.length; i < l; i++) {
        var data = createTagData(symbols[i]);
        if (data) {
            tagsData.push(data);

            if (!files[data.file]) {
                files[data.file] = true;
            }
        }
    }

    // create the required templates
    try {
        var templateFile = conf.simple ? 'tags-simple.tmpl' : 'tags-full.tmpl';
        var tagsTemplate = new JSDOC.JsPlate(conf.templatesDir + templateFile);
        var incremental = conf.outDir && conf.incremental && IO.exists(conf.outDir + '/tags');
        var addHeader = !!conf.outDir;
        var output = tagsTemplate.process({
            tags: tagsData,
            simple: conf.simple
        }, true);

        if (incremental) {
            // include existing tags for incremental updates
            var tags = IO.readFile(conf.outDir + '/tags');
            output = clean(tags, files) + output;
        }

        // sort tags
        output = output.split('\n').sort().join('\n');

        // replace empty lines
        output = output.replace(/\n/gm, '<LB>');
        output = output.replace(/<LB>(<LB>)*/g, '\n');

        if (addHeader) {
            output = [
                '!_TAG_FILE_FORMAT\t2\t/extended format; --format=1 will not append ;" to lines/',
                '!_TAG_FILE_SORTED\t1\t/0=unsorted, 1=sorted, 2=foldcase/',
                '!_TAG_PROGRAM_AUTHOR\tMichael Buettner\t/michbuett@gmx.net/',
                '!_TAG_PROGRAM_NAME\tJsDoc-Tags\t//',
                '!_TAG_PROGRAM_URL\thttps://github.com/michbuett/jsdoc-tags\t/official site/',
                '!_TAG_PROGRAM_VERSION\t0.1\t//',
            ].join('\n') + output;
        }

        if (conf.outDir) {
            IO.saveFile(conf.outDir, 'tags', output);
        } else {
            print(output);
        }
    } catch (e) {
        print('ERROR: ' + e);
        quit();
    }
}

/**
 * A symbol has the following properties
 * - type
 * - inheritsFrom
 * - addOn
 * - $args
 * - version
 * - isConstant
 * - isInner
 * - isNamespace
 * - augments
 * - fires
 * - desc
 * - alias
 * - id
 * - isStatic
 * - see
 * - methods
 * - comment
 * - memberOf
 * - since
 * - returns
 * - classDesc
 * - isEvent
 * - isIgnored
 * - isPrivate
 * - defaultValue
 * - srcFile
 * - exceptions
 * - isa
 * - _name
 * - _params
 * - deprecated
 * - requires
 * - author
 * - inherits
 * - example
 * - properties
 */
function createTagData(symbol) {
    'use strict';

    symbol = normalize(symbol);

    if (symbol.alias === '_global_') {
        return;
    }
    if (!symbol.line) {
        return;
    }
    if (!symbol.type) {
        return;
    }

    return {
        name: symbol.name,
        file: symbol.srcFile,
        type: symbol.type,
        line: symbol.line || 0,
        namespace: symbol.memberOf,
        access: getAccess(symbol),
        signature: getSignature(symbol)
    };
}

function normalize(symbol) {
    'use strict';

    symbol.name = (symbol._name || symbol.alias).replace(/^.*#/, '');
    symbol.type = getType(symbol);
    return symbol;
}

function getType(symbol) {
    'use strict';

    if (symbol.isNamespace) {
        return 'n';
    } else if (symbol.isEvent) {
        return 'e';
    } else if (symbol.isa === 'FUNCTION') {
        return 'f';
    } else if (symbol.isa === 'CONSTRUCTOR') {
        // a class
        return 'c';
    } else if (symbol.memberOf) {
        // a property
        return 'p';
    }
}

function getAccess(symbol) {
    'use strict';

    return symbol.isPrivate ? 'private' : 'public';
}

function getSignature(symbol) {
    'use strict';

    switch (symbol.type) {
    case 'p':
        // it's a property
        // -> : Type
        var type = getTagValue(symbol, 'type');
        return type ? ' : ' + type.replace(/\n.*/, '') : '';

    case 'f':
        // it's a function
        // -> (param1, param2, ...) : Type
        var params = symbol._params || [];
        var paramNames = [];
        var returnType = 'void';

        // collect the parameters
        for (var i = 0, l = params.length; i < l; i++) {
            var param = params[i];
            var name = param.name;

            if (param.defaultValue) {
                name += ' = ' + param.defaultValue;
            }
            if (param.isOptional) {
                name = '[' + name + ']';
            }
            paramNames.push(name);
        }

        // determine type of return value
        if (symbol.returns && symbol.returns.length > 0) {
            returnType = symbol.returns[0].type;
        }

        return ' (' + paramNames.join(', ') + ') : ' + returnType;

    default:
        return '';
    }
}

function getTagValue(symbol, tagName) {
    'use strict';

    var tags = symbol && symbol.comment && symbol.comment.tags;
    if (tags) {
        for (var i = 0, l = tags.length; i < l; i++) {
            if (tagName === tags[i].title) {
                return tags[i].desc;
            }
        }
    }
    return '';
}

/**
 * Removes header comments and the tags defined in the given files from a list
 * of existing tags
 * @private
 *
 * @param {String} rawTags The content of an existing tag file
 * @param {Object} files The set of files to clean (the keys are the filenames)
 * @return {String} The cleaned tags
 */
function clean(rawTags, files) {
    'use strict';

    var commentRe = /!_TAG_/;
    var result = [];
    var tags = rawTags.split('\n');
    var tests = [];

    for (var f in files) {
        if (files.hasOwnProperty(f)) {
            tests.push(new RegExp(f.replace(/\./g, '\\.').replace(/\//g, '\\/')));
        }
    }

    for (var i = 0, l = tags.length; i < l; i++) {
        var tag = tags[i];
        var match = !tag || commentRe.test(tag);

        for (var j = 0, k = tests.length; !match && j < k; j++) {
            match = tests[j].test(tag);
        }

        if (!match) {
            result.push(tag);
        }
    }
    return result.join('\n');
}
