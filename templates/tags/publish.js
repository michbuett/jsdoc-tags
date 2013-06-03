/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {

    publish.conf = {  // trailing slash expected for dirs
        outDir: JSDOC.opt.d,
        templatesDir: JSDOC.opt.t || SYS.pwd + '../templates/tags/'
    };

    if (publish.conf.outDir) {
        // create the folders to hold the output
        IO.mkPath(publish.conf.outDir);
    }

    var tagsData = [];
    var symbols = symbolSet.toArray(); // get an array version of the symbolset, useful for filtering
    var i, l;

    for (i = 0, l = symbols.length; i < l; i++) {
        var data = createTagData(symbols[i]);
        if (data) {
            tagsData.push(data);
        }
    }
    tagsData.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
    });

    // create the required templates
    try {
        var tagsTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'tags.tmpl');
        var output = tagsTemplate.process(tagsData, true);

        if (publish.conf.outDir) {
            IO.saveFile(publish.conf.outDir, 'tags', output);
        } else {
            print(output);
        }
    }
    catch (e) {
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
    //console.log('PROCESS SYMBOL: ', symbol.alias, symbol)
    //console.log('PROCESS SYMBOL: ', symbol.alias)

    if (symbol.alias === '_global_') {
        return;
    }

    if (!symbol.line) {
        return;
    }

    var name = (symbol._name || symbol.alias).replace(/^.*#/, '');
    return {
        name: name,
        file: symbol.srcFile,
        type: getType(symbol),
        line: symbol.line || 0,
        access: getAccess(symbol)
    };
}

function getType(symbol) {
    if (symbol.isNamespace) {
        return 'v';
    } else if (symbol.isEvent) {
        return 'e';
    } else if (symbol.isa === 'FUNCTION') {
        return 'f';
    } else if (symbol.isa === 'CONSTRUCTOR') {
        return 'c';
    } else if (symbol.memberOf) {
        return 'p';
    }
}

function getAccess(symbol) {
    return symbol.isPrivate ? 'private' : 'public';
}

function printSymbol(s) {
    print('\n### ' + s.alias + ' ###');
    for (var key in s) {
        if (s.hasOwnProperty(key)) {
            print(key + ': ' + s[key]);
        }
    }
}
