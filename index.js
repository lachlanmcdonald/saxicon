/*
 * saxicon 0.0.1
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const libxml = require('libxmljs');
const {getColorKeyword, isColorKeyword} = require('./lib/svgColors');

const SAFE_TAGS = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];
const COLOR_SPLIT_KEY = '__saxicon__';

const XML_DECLARATION_STRING = (new libxml.Document()).toString();

class SaxiconData {
	constructor(data) {
		this.data = data;
	}

	data() {
		return this.data;
	}

	scss() {
		let scssUtils = fs.readFileSync('./lib/saxicon.scss'),
			mapVariable = '$saxicon-map-' + (+new Date()),
			map = [];

		this.data.forEach((set) => {
			set.svg = set.components.map(x => {
				return isColorKeyword(x) ? x : ('"' + x.replace(/[^\ \-\.\d\w]/g, escape).replace(/"/g, '\'') + '"');
			}).join(', ');

			map.push('"' + set.iconName + '": (' + set.width + ', ' + set.height + ', (' + set.svg + '))');
		});

		map = [
			mapVariable + ': (' + map.join(',\n') + ');\n',
			'@if (variable_exists(saxicon-map)) {',
			'	$saxicon-map: map_merge($saxicon-map, ' + mapVariable + ') !global;',
			'} @else {',
			'	$saxicon-map: ' + mapVariable + ' !global;',
			'}'
		].join('\n');

		return `${scssUtils}\n${map}`;
	}
}

class Saxicon {
	constructor(options = {}) {
		this.options = Object.assign(Saxicon.defaultOptions, options);
	}

	static removeInsignificantWhitespace(doc) {
		return doc.replace(/>[\r\n\t ]+</g, '><').trim();
	}

	parse(paths) {
		return new SaxiconData(paths.map((svgPath) => {
			return this.parseFile(svgPath);
		}));
	}

	parseFile(svgPath) {
		const source = fs.readFileSync(svgPath).toString();
		let width = null,
			height = null,
			doc = null;

		try {
			doc = libxml.parseXmlString(source, this.options.parseOptions);
		} catch (e) {
			return {
				path: svgPath,
				errors: [{
					message: e.message.trim(),
					line: e.line,
					column: e.column
				}]
			};
		}

		// Document size
		const widthAttribute = doc.root().attr('width');
		const heightAttribute = doc.root().attr('height');
		const viewBoxAttribute = doc.root().attr('viewBox');

		if (widthAttribute !== null && heightAttribute !== null) {
			width = parseFloat(widthAttribute.value());
			height = parseFloat(heightAttribute.value());
		} else if (viewBoxAttribute !== null) {
			const viewBox = viewBoxAttribute.value().match(/\d+(?:\.\d+)?/g);
			width = parseFloat(viewBox[2]);
			height = parseFloat(viewBox[3]);
		}

		this.walkChildNodes(doc.root());

		// libxml adds in the XML declaration, which needs to be removed for SVGs
		let docString = doc.toString().replace(XML_DECLARATION_STRING, '');

		// Treat recoverable errors as warnings
		let warnings = doc.errors.map((e) => {
			return {
				message: e.message.trim(),
				line: e.line,
				column: e.column
			};
		});

		// Remove insignificant whitespace
		docString = Saxicon.removeInsignificantWhitespace(docString);

		return {
			path: svgPath,
			warnings: warnings,
			iconName: this.options.iconName(svgPath),
			width: width,
			height: height,
			components: docString.split(COLOR_SPLIT_KEY)
		};
	}

	allowedReplacement(color) {
		if (this.options.ignore.includes(color)) {
			return false;
		} else if (this.options.restrict.length > 0) {
			return this.options.restrict.includes(color);
		} else {
			return true;
		}
	}

	walkChildNodes(node) {
		const children = node.childNodes();

		for (let i = 0; i < children.length; i++) {
			const node = children[i];

			if (SAFE_TAGS.includes(node.name())) {
				const fillAttribute = node.attr('fill');
				const strokeAttribute = node.attr('stroke');
				let fillValue = (fillAttribute === null ? null : fillAttribute.value());
				let strokeValue = (strokeAttribute === null ? null : strokeAttribute.value());

				if (fillValue !== null && fillValue !== 'none') {
					if (this.options.replaceColors === true) {
						fillValue = getColorKeyword(fillValue);
					}

					if (isColorKeyword(fillValue)) {
						if (this.allowedReplacement(fillValue)) {
							fillAttribute.value(COLOR_SPLIT_KEY + fillValue + COLOR_SPLIT_KEY);
						}
					}
				}

				if (strokeValue !== null && strokeValue !== 'none') {
					if (this.options.replaceColors === true) {
						strokeValue = getColorKeyword(strokeValue);
					}

					if (isColorKeyword(strokeValue)) {
						if (this.allowedReplacement(strokeValue)) {
							strokeAttribute.value(COLOR_SPLIT_KEY + strokeValue + COLOR_SPLIT_KEY);
						}
					}
				}
			}

			this.walkChildNodes(node);
		}
	}
}

Saxicon.defaultOptions = {
	replaceColors: true,
	restrict: [],
	ignore: [],
	parseOptions: {
		ignore_enc: true,
		noxincnode: true,
		cdata: true,
		implied: true,
		nsclean: true,
		recover: true,
		noent: true,
		doctype: true,
		noblanks: true,
		nonet: true
	},
	iconName: (sourcePath) => {
		return path.basename(sourcePath).split('.')[0].trim();
	}
};

exports.Saxicon = Saxicon;
exports.SaxiconData = SaxiconData;
