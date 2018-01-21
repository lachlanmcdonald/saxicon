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

const LICENSE_TEXT = `	saxicon 0.0.1
	Copyright (c) 2018 Lachlan McDonald
	https://github.com/lachlanmcdonald/saxicon/

	Licensed under the BSD 3-Clause license.

	(This file is generated with saxicon and should not be updated manually.)`;

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
			set.svg = set.components.map(function(x) {
				var a = (x[x.length - 1] === '\'' || x[x.length - 1] === '"'),
					b = (x[0] === '\'' || x[0] === '"');

				return (a || b) ? '"' + x.replace(/[^\ \-\.\d\w]/g, escape).replace(/"/g, '\'') + '"' : x;
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

		return '/*\n' + LICENSE_TEXT + '\n*/\n\n' + map + '\n\n' + scssUtils;
	}
}

class Saxicon {
	constructor(options = {}) {
		this.options = Object.assign({
			replaceColors: true,
			restrict: [],
			ignore: [],
			license: LICENSE_TEXT,
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
		}, options);
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
		const doc = libxml.parseXmlString(source, this.options.parseOptions);
		let width = null,
			height = null;

		// Document size
		let widthAttribute = doc.root().attr('width');
		let heightAttribute = doc.root().attr('height');
		let viewBoxAttribute = doc.root().attr('viewBox');

		if (widthAttribute !== null && heightAttribute !== null) {
			width = parseFloat(widthAttribute.value());
			height = parseFloat(heightAttribute.value());
		} else if (viewBoxAttribute !== null) {
			let viewBox = viewBoxAttribute.value().match(/\d+(?:\.\d+)?/g);
			width = parseFloat(viewBox[2]);
			height = parseFloat(viewBox[3]);
		}

		this.walkChildNodes(doc.root());

		// libxml adds in the XML declaration, which needs
		// to be removed for SVGs
		let docString = doc.toString().replace(XML_DECLARATION_STRING, '');

		// Remove insignificant whitespace
		docString = Saxicon.removeInsignificantWhitespace(docString);

		return {
			path: svgPath,
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
				let stroke = node.attr('stroke');
				let fill = node.attr('fill');

				if (stroke !== null) {
					stroke.value();
				}
				if (fill !== null) {
					fill.value();
				}

				if (fill !== 'none') {
					if (this.options.replaceColors === true) {
						fill = getColorKeyword(fill);
					}

					if (isColorKeyword(fill)) {
						if (this.allowedReplacement(fill)) {
							node.attr('fill', (COLOR_SPLIT_KEY + fill + COLOR_SPLIT_KEY));
						}
					}
				}

				if (stroke !== null && stroke !== 'none') {
					if (this.options.replaceColors === true) {
						stroke = getColorKeyword(stroke);
					}

					if (isColorKeyword(stroke)) {
						if (this.allowedReplacement(stroke)) {
							node.attr('stroke', (COLOR_SPLIT_KEY + stroke + COLOR_SPLIT_KEY));
						}
					}
				}
			}

			this.walkChildNodes(node);
		}
	}
}

exports.Saxicon = Saxicon;
exports.SaxiconData = SaxiconData;
