(function(root) {
    var htmlEscape = function (str) {
        if (Object.prototype.toString.call(str) === '[object String]') {
            var escaper = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            var matcher = /&|<|>|"|'/g;
            str = str.replace(matcher, function (match) {
                return escaper[match];
            });
        }
        return str;
    };
    var matcher = /<%-([\s\S]+?)%>|<%%([\s\S]+?)%>|<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g,
        escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g,
        escapes = {
            '"':      '"',
            '\\':     '\\',
            '\r':     'r',
            '\n':     'n',
            '\t':     't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };
    var template = function (text, data) {
        var render,
            index = 0,
            source = "var temp = '';",
            funcs = "var funcs = {};";
        source += "temp += '";
        text.replace(matcher, function (match, escape, date, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace (escaper, function (match) {
                return '\\' + escapes[match];
            });
            if (escape) {
                funcs += "funcs.htmlEscape = " + htmlEscape.toString() + ";\n";
                source += "' +  funcs.htmlEscape(" + escape + ") + '";
            }
            if (date) {
                funcs += "funcs.formatDate = " + formatDate.toString() + ";\n";
                date = date.split("|");
                source += "' +  funcs.formatDate(" + date[0] + "," + date[1] + ") + '";
            }
            if (interpolate) {
                source += "' + " + interpolate + " + '";
            }
            if (evaluate) {
                source += "';" + evaluate + "temp += '";
            }
            index = offset + match.length;
            return match;
        });
        source += "';return temp;";
        source = "with(obj||{}){\n" + source + "}\n";
        source = funcs + source;
        try {
            render = new Function('obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }
        if (data) {
            return render(data);
        }
        var template = function (data) {
            return render.call(this, data);
        };
        template.source = 'function(' + ({} || 'obj') + '){\n' + source + '}';
        return template;
    };
    root.template = template;
})(this);
