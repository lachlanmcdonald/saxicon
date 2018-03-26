/*
 * saxicon 0.0.1
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const { Saxicon } = require('./index');
const { getColorKeyword, isColorKeyword } = require('./lib/svgColors');
const fs = require('fs');
const path = require('path');
const libxml = require('libxmljs');

const walkDirecory = (dir, results) => {
	if (typeof results === 'undefined') {
		results = [];
	}

	fs.readdirSync(dir).forEach((fileName) => {
		var filePath = path.join(dir, fileName),
			stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			results = walkDirecory(filePath, results);
		} else if (stats.isFile()) {
			if (path.extname(fileName) === '.svg') {
				results.push(filePath);
			}
		}
	});

	return results;
};

const SASS_ENGINE = {
	sassc: 'sassc',
	Ruby: 'sass'
};

const testFiles = {
	basic: walkDirecory('./svgs/basic')
};

describe('svgColors', () => {
	describe('getColorKeyword()', () => {
		test('retrieves keyword for color', () => {
			expect(getColorKeyword('000')).toBe('black');
			expect(getColorKeyword('000000')).toBe('black');
			expect(getColorKeyword('#000000')).toBe('black');
			expect(getColorKeyword('#000')).toBe('black');
		});

		test('returns the same value for invalid colors', () => {
			expect(getColorKeyword('123456')).toBe('123456');
			expect(getColorKeyword(123456)).toBe(123456);
			expect(getColorKeyword(true)).toBe(true);
			expect(getColorKeyword(false)).toBe(false);
			expect(getColorKeyword(null)).toBe(null);
			expect(getColorKeyword(undefined)).toBe(undefined);
		});
	});

	describe('isColorKeyword()', () => {
		test('returns true for valid keywords', () => {
			expect(isColorKeyword('black')).toBe(true);
			expect(isColorKeyword('BLACK')).toBe(true);
		});

		test('does not return true for invaild keywords', () => {
			expect(isColorKeyword('123456')).toBe(false);
			expect(isColorKeyword(123456)).toBe(false);
			expect(isColorKeyword(true)).toBe(false);
			expect(isColorKeyword(false)).toBe(false);
			expect(isColorKeyword(null)).toBe(false);
			expect(isColorKeyword(undefined)).toBe(false);
		});
	});
});

describe('Saxicon', () => {
	describe('removeInsignificantWhitespace()', () => {
		test('does remove insignificant whitespace', () => {
			const input = fs.readFileSync('./svgs/whitespace/whitespace.svg').toString();
			const correct = fs.readFileSync('./svgs/whitespace/no-whitespace.svg').toString();
			const updatedInput = Saxicon.removeInsignificantWhitespace(input);
			expect(updatedInput).toBe(correct);
		});

		test('has no side-effects with libxmljs', () => {
			testFiles.basic.forEach((filePath) => {
				const svg = fs.readFileSync(filePath).toString();
				const doc = libxml.parseXmlString(svg, Saxicon.defaultOptions.parseOptions);

				const updatedSvg = Saxicon.removeInsignificantWhitespace(doc.toString());
				const updatedDoc = libxml.parseXmlString(updatedSvg, Saxicon.defaultOptions.parseOptions);

				expect(doc.toString()).toBe(updatedDoc.toString());
			});
		});
	});
});
