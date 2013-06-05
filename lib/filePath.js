/**
 * @class FilePath
 * Manipulate a filepath.
 */
var FilePath = function (absPath, separator) {
    this.slash =  separator || '/';
    this.root = this.slash;
    this.path = [];
    this.file = '';

    var parts = absPath.split(/[\\\/]/);
    if (parts && parts.length > 0) {
        this.root = parts.shift() + this.slash;
        this.file = parts.pop();
        this.path = parts;
    }

    this.path = this.resolvePath();
};

/** Collapse any dot-dot or dot items in a filepath. */
FilePath.prototype.resolvePath = function () {
    var resolvedPath = [];

    for (var i = 0; i < this.path.length; i++) {
        if (this.path[i] == '..') {
            resolvedPath.pop();
        }
        else if (this.path[i] != '.') {
            resolvedPath.push(this.path[i]);
        }
    }
    return resolvedPath;
};

/** Trim off the filename. */
FilePath.prototype.toDir = function () {
    if (this.file) {
        this.file = '';
    }
    return this;
};

/** Go up a directory. */
FilePath.prototype.upDir = function () {
    this.toDir();
    if (this.path.length) {
        this.path.pop();
    }
    return this;
};

FilePath.prototype.toString = function () {
    return this.root + this.path.join(this.slash) + ((this.path.length > 0)? this.slash : '') + this.file;
};

/**
 * Turn a path into just the name of the file.
 */
FilePath.fileName = function (path) {
    var nameStart = Math.max(path.lastIndexOf('/') + 1, path.lastIndexOf('\\') + 1, 0);
    return path.substring(nameStart);
};

/**
 * Get the extension of a filename
 */
FilePath.fileExtension = function (filename) {
    return filename.split('.').pop().toLowerCase();
};

/**
 * Turn a path into just the directory part.
 */
FilePath.dir = function (path) {
    var nameStart = Math.max(path.lastIndexOf('/') + 1, path.lastIndexOf('\\') + 1, 0);
    return path.substring(0, nameStart - 1);
};

module.exports = FilePath;
