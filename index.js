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

const COLOR_SPLIT_KEY = '__saxicon__';

class SaxiconData {
	constructor(data, options = {}) {
		this.data = data;
		this.options = options;
	}

	uri() {
		return this.data.map(set => {
			return 'data:image/svg+xml,' + set.components.map(x => SaxiconData.encode(x)).join('');
		});
	}

	scss() {
		let scssUtils = fs.readFileSync('./lib/saxicon.scss', 'utf8'),
			mapVariable = '$saxicon-map-' + (+new Date()),
			map = [];

		this.data.forEach((set) => {
			set.svg = set.components.map(x => {
				return isColorKeyword(x) ? x : ('"' + SaxiconData.encode(x) + '"');
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

	static encode(s) {
		return s.replace(/[^\ \-\.\d\w\=\:\/]/g, escape).replace(/"/g, '\'').replace(/%u([a-f0-9]{4})/gi, '%26%23x$1;');
	}
}

class Saxicon {
	constructor(options = {}) {
		this.options = Object.assign(Saxicon.defaultOptions, options);
	}

	static removeInsignificantWhitespace(doc) {
		return doc.replace(/>[\r\n\t ]+</g, '><').trim();
	}

	static getXMLDeclarationString(version = '1.0', encoding = 'utf8') {
		return (new libxml.Document(version, encoding)).toString();
	}

	parse(paths) {
		const data = paths.map((svgPath) => {
			return this.parseFile(svgPath);
		});

		return new SaxiconData(data, this.options);
	}

	parseFile(svgPath) {
		let source = fs.readFileSync(svgPath, 'utf8'),
			width = null,
			height = null,
			rootNode = null,
			doc = null;

		// Strip byte-order mark
		if (source.charCodeAt(0) === 0xfeff) {
			source = source.slice(1);
		}

		try {
			doc = libxml.parseXmlString(source, this.options.parseOptions);
			rootNode = doc.root();
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
		const widthAttribute = rootNode.attr('width');
		const heightAttribute = rootNode.attr('height');
		const viewBoxAttribute = rootNode.attr('viewBox');

		if (widthAttribute !== null && heightAttribute !== null) {
			width = parseFloat(widthAttribute.value());
			height = parseFloat(heightAttribute.value());
		} else if (viewBoxAttribute !== null) {
			const viewBox = viewBoxAttribute.value().match(/\d+(?:\.\d+)?/g);
			width = parseFloat(viewBox[2]);
			height = parseFloat(viewBox[3]);
		}

		// Walk nodes
		this.walkChildNodes(rootNode);

		// Remove the version attribute
		if (this.options.removeVersion === true) {
			const versionAttribute = rootNode.attr('version');
			if (versionAttribute) {
				versionAttribute.remove();
			}
		}

		// libxml adds in the XML declaration, which needs to be removed for SVGs
		const version = doc.version();
		let docString = doc.toString().replace(Saxicon.getXMLDeclarationString(version), '');

		// Check if xlink:href is used, otherwise, remove xlink:xmlns
		const removeNamespace = [].concat(this.options.removeNamespaces);
		if (docString.indexOf(' xlink:href=') === -1) {
			removeNamespace.push('xmlns:xlink');
		}

		// Remove the namespace from the resulting string
		rootNode.namespaces().forEach(ns => {
			const prefix = ns.prefix() ? `:${ns.prefix()}` : '';
			const attribute = `xmlns${prefix}`;

			if (removeNamespace.includes(attribute)) {
				const str = ` ${attribute}="${ns.href()}"`;
				docString = docString.replace(str, '');
			}
		});

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
			components: docString.split(COLOR_SPLIT_KEY),
			iconName: this.options.iconName(svgPath),
			path: svgPath,
			warnings: warnings,
			errors: [],
			width: width,
			height: height
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

	walkChildNodes(node, inherited = null) {
		const children = node.childNodes();

		if (inherited === null) {
			inherited = {
				fill: null,
				stroke: null
			};
		}

		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			const nodeName = node.name();
			const ignored = this.options.ignoreTags.includes(nodeName);
			const includeTag = this.options.presentationTags.includes(nodeName) && ignored === false;
			const structuralTag = this.options.structuralTags.includes(nodeName) && ignored === false;

			let fillValue = inherited.fill;
			let strokeValue = inherited.stroke;

			if (node.type() === 'element') {
				if (includeTag || structuralTag) {
					const fillAttribute = node.attr('fill');
					const strokeAttribute = node.attr('stroke');
					fillValue = (fillAttribute === null ? fillValue : fillAttribute.value());
					strokeValue = (strokeAttribute === null ? strokeValue : strokeAttribute.value());

					if (structuralTag === false && fillAttribute === null) {
						fillValue = fillValue || 'black';
					}

					if (fillValue !== 'none') {
						if (this.options.replaceColors === true) {
							fillValue = getColorKeyword(fillValue);
						}
					}

					if (strokeAttribute !== null && strokeValue !== 'none') {
						if (this.options.replaceColors === true) {
							strokeValue = getColorKeyword(strokeValue);
						}
					}
				}

				if (includeTag) {
					if (isColorKeyword(fillValue)) {
						if (this.allowedReplacement(fillValue)) {
							node.attr({
								fill: COLOR_SPLIT_KEY + fillValue + COLOR_SPLIT_KEY
							});
						}
					}

					if (isColorKeyword(strokeValue)) {
						if (this.allowedReplacement(strokeValue)) {
							node.attr({
								stroke: COLOR_SPLIT_KEY + strokeValue + COLOR_SPLIT_KEY
							});
						}
					}
				}

				if (!ignored) {
					this.walkChildNodes(node, {
						fill: fillValue,
						stroke: strokeValue
					});
				}
			}
		}
	}
}

Saxicon.defaultOptions = {
	replaceColors: true,
	restrict: [],
	ignore: [],
	removeNamespaces: [],
	removeVersion: true,
	presentationTags: ['rect', 'circle', 'text', 'ellipse', 'line', 'polyline', 'polygon', 'path'],
	structuralTags: ['g'],
	ignoreTags: ['mask'],
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
