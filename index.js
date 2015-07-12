var fs = require('fs');
var path = require('path');

var CONFIG = {
    extname: '.lex',
    sep: '\r\n',
    delim: ' '
};

function invert(object) {
    var key;
    var dest = {};

    for (key in object) {
        dest[object[key]] = key;
    }

    return dest;
}

function Lexems() {
    this.lexems = {};
}

Lexems.prototype = {
    initKeywords: function(directory) {
        var lexems = fs.readdirSync(directory);
        var scope = this;
        this.lexems = {};
        this.lexemMaps = {};

        lexems.forEach(function(lexDefinition) {
            if (path.extname(lexDefinition) === CONFIG.extname) {
                var lexName = path.basename(lexDefinition).split('.')[0];
                var lexFile = String(fs.readFileSync(path.join(directory, lexDefinition)));

                scope.lexems[lexName] = {};

                lexFile = lexFile.split(CONFIG.sep);
                lexFile.forEach(function(lexem) {
                    var parts = lexem.split(CONFIG.delim);
                    scope.lexems[lexName][parts[0]] = parts[1];
                });

                scope.lexemMaps[lexName] = invert(scope.lexems[lexName]);
            }
        });
    },

    getKeywords: function(subset) {
        return this.lexems[subset];
    },

    getKeyword: function(subset, key) {
        return this.lexems[subset][key];
    },

    getKeyId: function(keyword, subset) {
        return this.lexemMaps[subset][keyword];
    },

    translate: function(keyword, sourceSubset, destinationSubset) {
        return this.lexems[destinationSubset][this.lexemMaps[sourceSubset][keyword]];
    },

    getTranslationOffset: function(keyword, sourceSubset, destinationSubset) {
        var sourceKeyword = keyword;
        var destinationKeyword = this.translate(keyword, sourceSubset, destinationSubset);

        return destinationKeyword.length - sourceKeyword.length;
    }
};

module.exports = new Lexems();