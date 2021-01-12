var should = require('should'),
    assert = require('assert'),
    path = require('../lib/path.js'),
    _ = require('underscore'),
    doc = {};

var pathTests = function () {
    describe('evaluatePath', function () {
        beforeEach(function () {
            doc = {};
        });

        it('should get a non-nested property that exists', function(done) {
            doc.testProperty = 'testValue';
            var returnVal = path.evaluatePath(doc, 'testProperty');
            returnVal.should.equal('testValue');
            done();
        });

        it('should return null if the non-nested property does not exist', function(done) {
            var returnVal = path.evaluatePath(doc, 'testProperty');
            assert.equal(returnVal, null);
            done();
        });

        it('should get a non-nested property that exists', function(done) {
            doc.testProperty = {testProperty2:'testValue'};
            var returnVal = path.evaluatePath(doc, 'testProperty.testProperty2');
            returnVal.should.equal('testValue');
            done();
        });

        it('should return null if the nested property does not exist', function(done) {
            var returnVal = path.evaluatePath(doc, 'testProperty.testProperty2');
            assert.equal(returnVal, null);
            done();
        });

        it('should work with multiple accesses', function (done) {
            doc = {
                testProperty : {
                    testProperty2: 'testVal'
                },
                'testProperty3' : 'testVal2'
            };
            var returnVal = path.evaluatePath(doc, 'testProperty.testProperty2');
            assert.equal(returnVal, 'testVal');
            returnVal = path.evaluatePath(doc, 'testProperty3');
            assert.equal(returnVal, 'testVal2');
            done();
        });
    });

    describe('setPath', function () {
        beforeEach(function () {
            doc = {};
        });

        it('should get a non-nested property that exists', function(done) {
            var returnVal = path.setPath(doc, 'testProperty', 'null');
            assert.equal(returnVal, doc);
            done();
        });

        it('should return null if the non-nested property does not exist', function(done) {
            try {
                doc = null;
                assert.equal(doc, null);
                var returnVal = path.setPath(doc, 'testProperty', 'null');
            } catch (err) {
                err.message.should.equal('No document was provided.');
                done();
            }
        });

        it('should get a non-nested property that exists', function(done) {
            var returnVal = path.setPath(doc, 'testProperty.testProperty2', 'testValue');
            assert.equal(returnVal, doc);
            done();
        });

        it('should return null if the nested property does not exist', function(done) {
            try {
                doc = null;
                assert.equal(doc, null);
                var returnVal = path.setPath(doc, 'testProperty.test', 'null');
            } catch (err) {
                err.message.should.equal('No document was provided.');
                done();
            }
        });

        it('should work with multiple accesses', function (done) {
            var returnVal = path.setPath(doc, 'testProperty.testProperty2', 'testVal');
            assert.equal(returnVal, doc);
            returnVal = path.setPath(doc, 'testProperty3', 'testVal2');
            assert.equal(returnVal, doc);
            done();
        });

        describe('prototype pollution', function () {
            it('should protect against prototype pollution via __proto__', function () {
                doc = {};
                var originalProto = doc.__proto__;
                assert.equal(originalProto.polluted, undefined);
                originalProto.foo = true;
                Object.freeze(originalProto);
                
                path.setPath(doc, '__proto__.polluted', 'prototype-polluted');

                assert.equal(originalProto.polluted, undefined, 'original [[Prototype]] is not polluted');
                assert.equal({}.polluted, undefined, 'new objects are not polluted');
                // use of Object.getOwnPropertyDescriptor is necessary because node 0.10 has a bug
                // where `obj['__proto__']` incorrectly does `obj.__proto__`, which is different.
                if (Object.getOwnPropertyDescriptor) {
                    assert.equal(Object.getOwnPropertyDescriptor(doc, '__proto__').value.polluted, 'prototype-polluted', 'new own __proto__ object is polluted');
                }
            });
        });
    });
};

module.exports = {
    runTests: function () {
        describe('path.js', function() {

            beforeEach(function () {
                doc = {};
            });

            // Run path tests
            pathTests();
        });
    }
};