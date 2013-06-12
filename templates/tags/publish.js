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
    symbol.name = (symbol._name || symbol.alias).replace(/^.*#/, '');
    symbol.type = getType(symbol);
    return symbol;
}

function getType(symbol) {
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
    return symbol.isPrivate ? 'private' : 'public';
}

function getSignature(symbol) {
    switch (symbol.type) {
    case 'p':
        // it's a property
        // -> : Type
        var type = getTagValue(symbol, 'type');
        return type ? ' : ' + type : '';

    case 'f':
        // it's a function
        // -> (param1, param2, ...) : Type
        var tags = symbol && symbol.comment && symbol.comment.tags;
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

