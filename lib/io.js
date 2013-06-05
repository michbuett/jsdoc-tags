var fs = require('fs');
var path = require('path');
var FilePath = require('./filePath.js');

/**
 * @class IO
 * A collection of functions that deal with reading a writing to disk.
 */
var IO = function () {

    /**
     * The file encoding. Defaults to <code>utf8</code>
     *
     * @property encoding
     * @type {String}
     * @private
     */
    this.encoding = 'utf8';
};

IO.prototype = {

    /**
     * Create a new file in the given directory, with the given name and contents.
     */
    saveFile: function(/**string*/ outDir, /**string*/ fileName, /**string*/ content) {
        fs.writeFileSync(outDir + "/" + fileName, content, this.encoding);
    },

    /**
     * @type string
     */
    readFile: function(/**string*/ path) {
        return fs.readFileSync(path, this.encoding);
    },

    /**
     * @param inFile
     * @param outDir
     * @param [fileName=The original filename]
     */
    copyFile: function(/**string*/ inFile, /**string*/ outDir, /**string*/ fileName) {
        inFile = path.normalize(inFile);
        outFile = path.normalize(outDir + "/" + fileName);
        fileName = fileName || FilePath.fileName(inFile);

        if (!path.existsSync(inFile)) {
            // Could not find file to copy, ignoring: ' + inFile
            // Should we log or safe to ignore?
            return;
        }
        fs.createReadStream(inFile).pipe(fs.createWriteStream(outFile));
    },

    /**
     * Creates a series of nested directories.
     */
    mkPath: function(/**Array*/ path) {
        if (typeof path === 'string') {
            path = path.split(/[\\\/]/);
        }
        if (!Array.isArray(path)) {
            return;
        }

        var make = '';
        for (var i = 0, l = path.length; i < l; i++) {
            make += path[i] + SYS.slash;

            if (!this.exists(make)) {
                this.makeDir(make);
            }
        }
    },

    /**
     * Creates a directory at the given path.
     */
    makeDir: function(/**string*/ path) {
        fs.mkdirSync(path, 0777);
    },

    /**
     * @type string[]
     * @param dir The starting directory to look in.
     * @param [recurse=1] How many levels deep to scan.
     * @returns An array of all the paths to files in the given dir.
     */
    ls: function(/**string*/ dir, /**number*/ recurse, _allFiles, _path) {
        if (!_path) { // initially
            _allFiles = [];
            _path = [dir];
        }
        if (_path.length === 0) {
            return _allFiles;
        }
        recurse = recurse >= 0 ? recurse : 1;

        var s = fs.statSync(dir);
        if (!s.isDirectory()) {
            return [dir];
        }

        var files = fs.readdirSync(dir);
        for (var f = 0; f < files.length; f++) {
            var file = files[f];
            if (file.match(/^\.[^\.\/\\]/)) continue; // skip dot files

            if ((fs.statSync(_path.join("/") + "/" + file).isDirectory())) { // it's a directory
                _path.push(file);

                if (_path.length-1 < recurse) {
                    this.ls(_path.join("/"), recurse, _allFiles, _path);
                }
                _path.pop();
            }
            else {
                _allFiles.push((_path.join("/")+"/"+file).replace("//", "/"));
            }
        }

        return _allFiles;
    },

    /**
     * @type boolean
     */
    exists: function(/**string*/ path) {
        try {
            fs.statSync(path);
            return true;
        } catch(e) {
            return false;
        }
    },

    /**
     *
     */
    open: function(/**string*/ path, /**boolean*/ append) {
        if (append !== false) {
            append = true;
        }
        return fs.createWriteStream(path, {
            flags: (append ? "a" : "w")
        });
    },

    /**
     * Sets {@link IO.encoding}.
     * Encoding is used when reading and writing text to files,
     * and in the meta tags of HTML output.
     */
    setEncoding: function(/**string*/ encoding) {
        if (/UTF-8/i.test(encoding)) {
            this.encoding = "utf8";
        }
        else if (/ASCII/i.test(encoding)) {
            this.encoding = "ascii";
        }
        else {
            throw("Unsupported encoding: "+encoding+" - perhaps you can use UTF-8?");
        }
    },


    /**
     * Load the given script.
     */
    include: function(relativePath) {
        load(SYS.pwd+relativePath);
    },

    /**
     * Loads all scripts from the given directory path.
     */
    includeDir: function(path) {
        if (!path) {
            return;
        }
        for (var lib = this.ls(SYS.pwd+path), i = 0; i < lib.length; i++) {
            if (/\.js$/i.test(lib[i])) {
                load(lib[i]);
            }
        }
    }
};

module.exports = {
    create: function () {
        return new IO();
    }
};
