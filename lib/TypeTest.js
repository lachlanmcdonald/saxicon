/*
 * saxicon
 * Copyright (c) 2019 Lachlan McDonald
 * https://github.com/lachlanmcdonald/saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */

// Shim Object.values for Node 6.x
if (!Object.values) {
	require('object.values').shim();
}

class TypeTest {
	constructor() {
		this.tests = [];
	}

	isBoolean(o, k) {
		this.tests.push(['isBoolean', Object.values(arguments)]);
		if (o.hasOwnProperty(k) && typeof o[k] !== 'boolean') {
			throw new Error(`'${k}' is not a boolean: ${typeof o[k]}`);
		}
	}

	isFunction(o, k) {
		this.tests.push(['isFunction', Object.values(arguments)]);
		if (o.hasOwnProperty(k) && typeof o[k] !== 'function') {
			throw new Error(`'${k}' is not a function: ${typeof o[k]}`);
		}
	}

	functionReturnsType(o, k, returnType, functionArgs) {
		this.tests.push(['functionReturnsType', Object.values(arguments)]);
		this.isFunction(o, k);

		if (o.hasOwnProperty(k)) {
			const j = typeof o[k].apply(null, functionArgs);
			if (j !== returnType) {
				throw new Error(`'${k}' did not return a ${returnType}: ${j}`);
			}
		}
	}

	isArray(o, k) {
		this.tests.push(['isArray', Object.values(arguments)]);
		if (o.hasOwnProperty(k)) {
			if (Array.isArray(o[k]) === false) {
				throw new Error(`'${k}' is not an array: ${typeof o[k]}`);
			}
		}
	}

	isNotEmpty(o, k) {
		this.tests.push(['isNotEmpty', Object.values(arguments)]);
		if (o.hasOwnProperty(k) && Array.isArray(o[k]) && o[k].length === 0) {
			throw new Error(`'${k}' cannot be empty`);
		}
	}

	isObject(o, k) {
		this.tests.push(['isObject', Object.values(arguments)]);

		if (o.hasOwnProperty(k) && (typeof o[k] !== 'object' || o[k] === Object(o[k]))) {
			throw new Error(`'${k}' must be an object`);
		}
	}

	isArrayOf(o, k, type) {
		this.tests.push(['isArrayOf', Object.values(arguments)]);
		this.isArray(o, k);

		if (o.hasOwnProperty(k)) {
			for (let i = 0; i < o[k].length; i++) {
				const j = typeof o[k][i];
				if (j !== type) {
					throw new Error(`Elements in '${k}' must be of type ${type}: ${j} at position ${i}`);
				}
			}
		}
	}
}

exports.TypeTest = TypeTest;
