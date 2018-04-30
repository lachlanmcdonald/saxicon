/*
 * saxicon 1.0.0
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const { Saxicon } = require('./index');
const { execSync } = require('child_process');
const { testConfig } = require('./package.json');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

const walkDirecory = (dir, results) => {
	if (typeof results === 'undefined') {
		results = [];
	}

	fs.readdirSync(dir).forEach((fileName) => {
		let filePath = path.join(dir, fileName),
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

const tests = [];

fs.readdirSync('svgs').forEach((fileName) => {
	const fullPath = path.join('svgs', fileName);
	const stats = fs.statSync(fullPath);
	const baseName = path.basename(fullPath, path.extname(fullPath));

	if (stats.isFile()) {
		if (path.extname(fileName) === '.scss') {
			tests.push({
				path: fullPath,
				baseName: baseName,
				html: path.join('svgs', `${baseName}.html`),
				files: walkDirecory(path.join('svgs', baseName))
			});
		}
	}
});

tests.forEach((test) => {
	const sax = new Saxicon();
	const results = sax.parseSync(test.files);

	const tempFile = tmp.fileSync({postfix: '.scss'});
	fs.writeSync(tempFile.fd, `
		${results.scss()}
		${fs.readFileSync(test.path)}
	`);

	Object.keys(testConfig.engines).forEach((engine) => {
		const command = testConfig.engines[engine];
		const output = execSync(`${command} "${tempFile.name}"`);
		const html = fs.readFileSync(test.html);
		const outputDir = path.join('tests', engine);

		try {
			fs.mkdirSync('tests');
		} catch (e) {
			if (e.code !== 'EEXIST') {
				throw e;
			}
		}

		try {
			fs.mkdirSync(outputDir);
		} catch (e) {
			if (e.code !== 'EEXIST') {
				throw e;
			}
		}

		fs.writeFileSync(path.join(outputDir, `${test.baseName}.html`), html.toString().replace('%STYLE%', output.toString()));
	});
});
