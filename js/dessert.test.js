/*global dessert, module, test, expect, raises, equal, strictEqual, deepEqual, ok */
(function () {
    "use strict";

    module('dessert');

    test("General assertion", function () {
        equal(dessert.assert(true), dessert, "Assertion success returns namespace");

        raises(function () {
            dessert.assert(false);
        }, "Failed assertion raises exception");
    });

    test("Custom handler", function () {
        expect(6);

        dessert.customHandler(function (expr, message) {
            ok(true, "Custom handler called");
            equal(message, "foo", "Message passed to custom handler");
        });
        raises(function () {
            dessert.assert(false, "foo");
        }, "Assertion with custom handler");

        dessert.customHandler(function () {
            ok(true, "Custom handler prevents exception");
            return false;
        });
        dessert.assert(false, "foo");

        dessert.customHandler(function (expr, arg1, arg2) {
            equal(arg1, "foo", "Multi-part message");
            equal(arg2, "bar", "Multi-part message");
            return false;
        });
        dessert.assert(false, "foo", "bar");

        dessert.customHandler(undefined);
    });

    test("Type addition", function () {
        raises(function () {
            dessert.addType('assert', function () {});
        }, "Attempting to replace core function");

        ok(!dessert.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        raises(function () {
            dessert.addType(1, function () {});
        }, "Invalid method name argument raises exception");

        raises(function () {
            dessert.addType('test', 'foo');
        }, "Invalid validator argument raises exception");

        function validator(expr) {
            // returning a boolean expression to be passed to `.assert`
            return expr === 'test';
        }

        dessert.addType('test', validator);

        ok(dessert.hasOwnProperty('test'), "New property added to namespace");

        raises(function () {
            dessert.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        equal(dessert.addType('test', validator), dessert, "Adding the same validator again (silently)");

        equal(dessert.test('test'), dessert, "Custom assertion passed");

        raises(function () {
            dessert.test('foo');
        }, "Custom assertion failed");

        // removing custom handler
        delete dessert.validators.test;
        delete dessert.test;
    });

    test("Type addition with override", function () {
        dessert.addType('test', function () {});

        raises(function () {
            dessert.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        dessert.addType(
            'test',
            function (expr) {return expr === 'overwritten';},
            true
        );

        equal(dessert.test('overwritten'), dessert, "Custom assertion passed");

        // removing custom handler
        delete dessert.validators.test;
        delete dessert.test;
    });

    test("Assertion messages", function () {
        expect(2);

        function testValidator(expr) {
            return expr === 'test';
        }

        dessert.addType('testTypeWithMessage', testValidator);

        var backup = dessert.assert;
        dessert.assert = function (expr, message) {
            strictEqual(expr, testValidator, "Validator passed");
            deepEqual(
                Array.prototype.slice.call(arguments, 1),
                [
                    'foo',
                    "Assertion failed",
                    1
                ],
                "Composite multi-part assertion message"
            );
        };

        dessert.testTypeWithMessage('foo', "Assertion failed", 1);

        dessert.assert = backup;

        // removing custom handler
        delete dessert.validators.testTypeWithMessage;
        delete dessert.testTypeWithMessage;
    });

    test("Multiple type addition", function () {
        ok(!dessert.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        dessert.addTypes({
            test: function (expr) {
                // returning a boolean expression to be passed to `.assert`
                return expr === 'test';
            }
        });

        equal(dessert.test('test'), dessert, "Custom assertion passed");

        raises(function () {
            dessert.test('foo');
        }, "Custom assertion failed");

        // removing custom handler
        delete dessert.validators.test;
        delete dessert.test;
    });
}());
