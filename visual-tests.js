const { Saxicon } = require('./index');
const { execSync } = require('child_process');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

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

const files = [];

fs.readdirSync('svgs').forEach((fileName) => {
	const fullPath = path.join('svgs', fileName);
	const stats = fs.statSync(fullPath);
	const baseName = path.basename(fullPath, path.extname(fullPath));

	if (stats.isFile()) {
		if (path.extname(fileName) === '.scss') {
			files.push({
				path: fullPath,
				output: path.join('tests', `${baseName}.html`),
				html: path.join('svgs', `${baseName}.html`),
				files: walkDirecory(path.join('svgs', baseName))
			});
		}
	}
});

for (var i = 0; i < files.length; i++) {
	const test = files[i];
	const sax = new Saxicon();
	const results = sax.parse(test.files);

	const tempFile = tmp.fileSync({postfix: '.scss'});
	fs.writeSync(tempFile.fd, `
		${results.scss()}
		${fs.readFileSync(test.path)}
	`);

	const output = execSync(`sassc "${tempFile.name}"`);
	const html = fs.readFileSync(test.html);

	try {
		fs.mkdirSync('tests');
	} catch (e) {
		if (e.code !== 'EEXIST') {
			throw e;
		}
	}

	fs.writeFileSync(test.output, html.toString().replace('%STYLE%', output.toString()));
}
