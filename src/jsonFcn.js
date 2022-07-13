
var MyJSON = () => {};
MyJSON.prototype.stringify = function (obj) {
    return JSON.stringify(obj, function (key, value) {
        return (typeof value === 'function') ? value.toString() : value;
    });
};
MyJSON.prototype.parse = function (str) {
    return JSON.parse(str, function (key, value) {
        if (typeof value != 'string') return value;
        return (value.substring(0, 8) == 'function') ? eval('(' + value + ')') : value;
    });
};

module.exports = MyJSON;