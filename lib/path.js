var controller = {};

controller.evaluatePath = function (document, keyPath) {
    if (!document) { return null; }
    var indexOfDot = keyPath.indexOf('.');

    // If there is a '.' in the keyPath, recur on the subdoc and ...
    if (indexOfDot >= 0) {
        var currentKey = keyPath.slice(0, indexOfDot),
            remainingKeyPath = keyPath.slice(indexOfDot + 1);

        return controller.evaluatePath(document[currentKey], remainingKeyPath);
    }

    return document[keyPath];
};

var dP = Object.defineProperty;
var has = Object.prototype.hasOwnProperty;
var gOPD = Object.getOwnPropertyDescriptor;

controller.setPath = function (document, keyPath, value) {
    'use strict';
    if (!document) { throw new Error('No document was provided.'); }

    var indexOfDot = keyPath.indexOf('.');

    // If there is a '.' in the keyPath, recur on the subdoc and ...
    if (indexOfDot >= 0) {
        var currentKey = keyPath.slice(0, indexOfDot),
            remainingKeyPath = keyPath.slice(indexOfDot + 1);

        if (currentKey === '__proto__') {
            if (!has.call(document, currentKey) && typeof dP === 'function' && typeof gOPD === 'function') {
                dP(document, currentKey, {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: { bar: false }
                });
            }
            // use of Object.getOwnPropertyDescriptor is necessary because node 0.10 has a bug
            // where `obj['__proto__']` incorrectly does `obj.__proto__`, which is different.
            controller.setPath(gOPD(document, currentKey).value, remainingKeyPath, value);
        } else {
            if (!document[currentKey]) { document[currentKey] = {}; }
            controller.setPath(document[currentKey], remainingKeyPath, value);
        }
    } else {
        if (keyPath === '__proto__' && typeof dP === 'function') {
            dP(document, keyPath, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            });
        } else {
            document[keyPath] = value;
        }
    }

    return document;
};

module.exports = controller;