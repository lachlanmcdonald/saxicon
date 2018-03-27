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
const { execSync } = require('child_process');
const tmp = require('tmp');
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

const SASS_ENGINES = {
	sassc: 'sassc',
	Ruby: 'sass --no-cache'
};

const testFiles = {
	basic: walkDirecory(path.join('svgs', 'basic'))
};

describe('svgColors', () => {
	describe('getColorKeyword()', () => {
		test('returns keyword for color', () => {
			expect(getColorKeyword('000')).toBe('black');
			expect(getColorKeyword('000000')).toBe('black');
			expect(getColorKeyword('#000000')).toBe('black');
			expect(getColorKeyword('#000')).toBe('black');
			expect(getColorKeyword('#fff')).toBe('white');
			expect(getColorKeyword('#FFF')).toBe('white');
		});

		test('returns keyword for differnt spelling', () => {
			expect(getColorKeyword('0FF')).toBe('cyan');
			expect(getColorKeyword('2F4F4F')).toBe('darkslategrey');
			expect(getColorKeyword('696969')).toBe('dimgrey');
			expect(getColorKeyword('708090')).toBe('slategrey');
			expect(getColorKeyword('789')).toBe('lightslategrey');
			expect(getColorKeyword('808080')).toBe('grey');
			expect(getColorKeyword('A9A9A9')).toBe('darkgrey');
			expect(getColorKeyword('D3D3D3')).toBe('lightgrey');
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
			// Keywords in COLOR_LOOKUP
			expect(isColorKeyword('black')).toBe(true);
			expect(isColorKeyword('BLACK')).toBe(true);

			// Duplicate keywords (differnt spelling)
			expect(isColorKeyword('aqua')).toBe(true);
			expect(isColorKeyword('darkslategray')).toBe(true);
			expect(isColorKeyword('dimgray')).toBe(true);
			expect(isColorKeyword('slategray')).toBe(true);
			expect(isColorKeyword('lightslategray')).toBe(true);
			expect(isColorKeyword('gray')).toBe(true);
			expect(isColorKeyword('darkgray')).toBe(true);
			expect(isColorKeyword('lightgray')).toBe(true);
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
	describe('XML Declarations', () => {
		test('Omitted XML declaration does not return errors or warnings', () => {
			const sax = new Saxicon();
			const results = sax.parse([
				path.join('svgs', 'xmldeclaration', 'xmldeclaration10.svg')
			]);

			for (var i = 0; i < results.data.length; i++) {
				expect(results.data[i].warnings).toHaveLength(0);
				expect(results.data[i].errors).toHaveLength(0);
			}
		});

		test('XML version 1.0 does not return errors or warnings', () => {
			const sax = new Saxicon();
			const results = sax.parse([
				path.join('svgs', 'xmldeclaration', 'xmldeclaration10.svg')
			]);

			for (var i = 0; i < results.data.length; i++) {
				expect(results.data[i].warnings).toHaveLength(0);
				expect(results.data[i].errors).toHaveLength(0);
			}
		});

		test('XML version 1.1 returns a warning', () => {
			const sax = new Saxicon();
			const results = sax.parse([
				path.join('svgs', 'xmldeclaration', 'xmldeclaration11.svg')
			]);

			for (var i = 0; i < results.data.length; i++) {
				expect(results.data[i].warnings.length).toBeGreaterThan(0);
				expect(results.data[i].errors).toHaveLength(0);
			}
		});
	});

	describe('Dimensions', () => {
		const sax = new Saxicon();

		test('Both viewBox and attributes', () => {
			const results = sax.parse([
				path.join('svgs', 'dimensions', 'both.svg')
			]);

			expect(results.data[0].width).toBe(134);
			expect(results.data[0].height).toBe(134);
		});

		test('Only viewBox', () => {
			const results = sax.parse([
				path.join('svgs', 'dimensions', 'viewbox.svg')
			]);

			expect(results.data[0].width).toBe(134);
			expect(results.data[0].height).toBe(134);
		});

		test('Only attributes', () => {
			const results = sax.parse([
				path.join('svgs', 'dimensions', 'attributes.svg')
			]);

			expect(results.data[0].width).toBe(134);
			expect(results.data[0].height).toBe(134);
		});

		test('Neither viewBox and attributes', () => {
			const results = sax.parse([
				path.join('svgs', 'dimensions', 'none.svg')
			]);

			expect(results.data[0].width).toBeNull();
			expect(results.data[0].height).toBeNull();
		});
	});

	describe('removeInsignificantWhitespace()', () => {
		test('does remove insignificant whitespace', () => {
			const input = fs.readFileSync(path.join('svgs', 'whitespace', 'whitespace.svg'), 'utf8');
			const correct = fs.readFileSync(path.join('svgs', 'whitespace', 'no-whitespace.svg'), 'utf8');
			const updatedInput = Saxicon.removeInsignificantWhitespace(input);
			expect(updatedInput).toBe(correct);
		});

		test('has no side-effects with libxmljs', () => {
			testFiles.basic.forEach((filePath) => {
				const svg = fs.readFileSync(filePath, 'utf8');
				const doc = libxml.parseXmlString(svg, Saxicon.defaultOptions.parseOptions);

				const updatedSvg = Saxicon.removeInsignificantWhitespace(doc.toString());
				const updatedDoc = libxml.parseXmlString(updatedSvg, Saxicon.defaultOptions.parseOptions);

				expect(doc.toString()).toBe(updatedDoc.toString());
			});
		});
	});
});

Object.keys(SASS_ENGINES).forEach((name) => {
	const command = SASS_ENGINES[name];

	describe('Compiles', () => {
		describe(name, () => {
			test('all test inputs with no warnings', () => {
				const sax = new Saxicon();
				const results = sax.parse(testFiles.basic);

				for (var i = 0; i < results.data.length; i++) {
					expect(results.data[i].warnings).toHaveLength(0);
					expect(results.data[i].errors).toHaveLength(0);
				}

				const tempFile = tmp.fileSync({postfix: '.scss'});
				fs.writeSync(tempFile.fd, results.scss());

				execSync(`${command} "${tempFile.name}"`);
			});
		});
	});
});

