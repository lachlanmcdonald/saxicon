/*
 * saxicon
 * Copyright (c) 2019 Lachlan McDonald
 * https://github.com/lachlanmcdonald/saxicon/
 * (Licensed under the BSD 3-Clause license)
 */

const { Saxicon} = require('./index');
const { getColorKeyword, isColorKeyword } = require('./lib/Colors');
const { execSync} = require('child_process');
const { testConfig} = require('./package.json');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

const walkDirecory = (dir, results = []) => {
	fs.readdirSync(dir).forEach(fileName => {
		const filePath = path.join(dir, fileName);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			walkDirecory(filePath, results);
		} else if (stats.isFile()) {
			if (path.extname(fileName) === '.svg') {
				results.push(filePath);
			}
		}
	});

	return results;
};

const TEST_FILES = {
	basic: walkDirecory(path.join('svgs', 'basic')),
	blend: walkDirecory(path.join('svgs', 'blend')),
	gradient: walkDirecory(path.join('svgs', 'gradient')),
	mask: walkDirecory(path.join('svgs', 'mask')),
	utf8: walkDirecory(path.join('svgs', 'utf8')),
};

describe('svgColors', () => {
	describe('getColorKeyword()', () => {
		test('Returns keyword for color', () => {
			expect(getColorKeyword('000')).toBe('black');
			expect(getColorKeyword('000000')).toBe('black');
			expect(getColorKeyword('#000000')).toBe('black');
			expect(getColorKeyword('#000')).toBe('black');
			expect(getColorKeyword('#fff')).toBe('white');
			expect(getColorKeyword('#FFF')).toBe('white');
		});

		test('Returns keyword for differnt spelling', () => {
			expect(getColorKeyword('0FF')).toBe('cyan');
			expect(getColorKeyword('2F4F4F')).toBe('darkslategrey');
			expect(getColorKeyword('696969')).toBe('dimgrey');
			expect(getColorKeyword('708090')).toBe('slategrey');
			expect(getColorKeyword('789')).toBe('lightslategrey');
			expect(getColorKeyword('808080')).toBe('grey');
			expect(getColorKeyword('A9A9A9')).toBe('darkgrey');
			expect(getColorKeyword('D3D3D3')).toBe('lightgrey');
		});

		test('Returns the same value for invalid colors', () => {
			expect(getColorKeyword('123456')).toBe('123456');
			expect(getColorKeyword(123456)).toBe(123456);
			expect(getColorKeyword(true)).toBe(true);
			expect(getColorKeyword(false)).toBe(false);
			expect(getColorKeyword(null)).toBe(null);
		});
	});

	describe('isColorKeyword()', () => {
		test('Returns true for valid keywords', () => {
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

		test('Does not return true for invaild keywords', () => {
			expect(isColorKeyword('123456')).toBe(false);
			expect(isColorKeyword(123456)).toBe(false);
			expect(isColorKeyword(true)).toBe(false);
			expect(isColorKeyword(false)).toBe(false);
			expect(isColorKeyword(null)).toBe(false);
		});
	});
});

describe('Saxicon', () => {
	describe('constructor()', () => {
		describe('Throws on invalid input', () => {
			const OPTION_TESTS = {};

			const REVERSE_TYPES = {
				boolean: null,
				function: null,
				number: null,
				object: 1,
				string: 1,
				symbol: null,
				undefined: 1,
			};

			Saxicon.validateOptions().forEach(optionTest => {
				const [type, args] = optionTest;

				if (OPTION_TESTS.hasOwnProperty(args[1]) === false) {
					OPTION_TESTS[args[1]] = [];
				}

				OPTION_TESTS[args[1]].push([type, args.slice(2)]);
			});

			for (const property in OPTION_TESTS) {
				if (OPTION_TESTS.hasOwnProperty(property)) {
					test(property, () => {
						OPTION_TESTS[property].forEach(x => {
							const [fn, args] = x;

							if (['isBoolean', 'isFunction', 'isArray'].includes(fn)) {
								expect(() => {
									new Saxicon({
										[property]: null,
									});
								}).toThrow();
							} else if (fn === 'isObject') {
								expect(() => {
									new Saxicon({
										[property]: [],
									});
								}).toThrow();
							} else if (fn === 'isNotEmpty') {
								expect(() => {
									new Saxicon({
										[property]: [],
									});
								}).toThrow();
							} else if (fn === 'isArrayOf') {
								expect(() => {
									new Saxicon({
										[property]: [REVERSE_TYPES[args[0]]],
									});
								}).toThrow();
							} else if (fn === 'functionReturnsType') {
								const erroneousFunction = () => REVERSE_TYPES[args[1]];

								expect(() => {
									new Saxicon({
										[property]: erroneousFunction,
									});
								}).toThrow();
							}
						});
					});
				}
			}
		});
	});

	describe('parse()', () => {
		test('Catches ENOENT errors', () => {
			const sax = new Saxicon();
			const results = sax.parseSync([
				'filedoesntexist.svg',
			]);

			expect(results.exportable).toHaveLength(0);
			expect(results.errors).toHaveLength(1);
		});

		describe('Throws on', () => {
			const TEST_FILES = {
				'Empty file': 'empty.svg',
				'No close tag': 'noCloseTag.svg',
				'No closing SVG tag': 'noClosingSVG.svg',
				'Extra close tag': 'extraCloseTag.svg',
				'SVG not root tag': 'notRoot.svg',
				'Unclosed attribute': 'unclosedAttribute.svg',
			};

			for (const testName in TEST_FILES) {
				if (TEST_FILES.hasOwnProperty(testName)) {
					test(testName, () => {
						const sax = new Saxicon();
						const results = sax.parseSync([
							path.join('svgs', 'bad', TEST_FILES[testName]),
						]);

						for (let i = 0; i < results.data.length; i += 1) {
							expect(results.data[i].errors.length).toBeGreaterThan(0);
						}
					});
				}
			}
		});
	});

	describe('XML Declarations', () => {
		test('Omitted XML declaration does not return errors', () => {
			const sax = new Saxicon();
			const results = sax.parseSync([
				path.join('svgs', 'xmldeclaration', 'none.svg'),
			]);

			for (let i = 0; i < results.data.length; i += 1) {
				expect(results.data[i].errors).toHaveLength(0);
			}
		});

		test('XML declaration are not included in result', () => {
			const sax = new Saxicon();
			const results = sax.parseSync([
				path.join('svgs', 'xmldeclaration', 'xmldeclaration10.svg'),
				path.join('svgs', 'xmldeclaration', 'xmldeclaration11.svg'),
			]);

			for (let i = 0; i < results.data.length; i += 1) {
				expect(results.data[i].errors).toHaveLength(0);
				expect(results.data[i].components.join('')).not.toEqual(expect.stringMatching(/<?xml[^?]+\?>/u));
			}
		});
	});

	describe('Dimensions', () => {
		const sax = new Saxicon();

		test('Both viewBox and attributes', () => {
			const results = sax.parseSync([
				path.join('svgs', 'dimensions', 'both.svg'),
			]);

			expect(results.data[0].width).toBe(134);
			expect(results.data[0].height).toBe(134);
		});

		test('Only viewBox', () => {
			const results = sax.parseSync([
				path.join('svgs', 'dimensions', 'viewbox.svg'),
			]);

			expect(results.data[0].width).toBe(134);
			expect(results.data[0].height).toBe(134);
		});

		test('Only attributes', () => {
			const results = sax.parseSync([
				path.join('svgs', 'dimensions', 'attributes.svg'),
			]);

			expect(results.data[0].width).toBe(134);
			expect(results.data[0].height).toBe(134);
		});

		test('Neither viewBox and attributes', () => {
			const results = sax.parseSync([
				path.join('svgs', 'dimensions', 'none.svg'),
			]);

			expect(results.data[0].width).toBeNull();
			expect(results.data[0].height).toBeNull();
		});
	});

	describe('removeWhitespace()', () => {
		test('Does remove insignificant whitespace', () => {
			const input = fs.readFileSync(path.join('svgs', 'whitespace', 'whitespace.svg'), 'utf8');
			const correct = fs.readFileSync(path.join('svgs', 'whitespace', 'no-whitespace.svg'), 'utf8');
			const updatedInput = Saxicon.removeWhitespace(input);

			expect(updatedInput).toBe(correct);
		});
	});
});

Object.keys(testConfig.engines).forEach(name => {
	const command = testConfig.engines[name];

	describe('Compiles', () => {
		describe(name, () => {
			test('All inputs are processed with no errors', () => {
				const sax = new Saxicon();
				const results = sax.parseSync([
					...TEST_FILES.basic,
					...TEST_FILES.blend,
					...TEST_FILES.gradient,
					...TEST_FILES.mask,
					...TEST_FILES.utf8,
				]);

				for (let i = 0; i < results.data.length; i += 1) {
					expect(results.data[i].errors).toHaveLength(0);
				}

				const tempFile = tmp.fileSync({postfix: '.scss'});

				fs.writeSync(tempFile.fd, results.scss());

				execSync(`${command} "${tempFile.name}"`);
			});
		});
	});
});
