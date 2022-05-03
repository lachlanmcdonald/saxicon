/*
 * Copyright (c) 2022 Lachlan McDonald
 * This work is licensed under the MIT License (MIT)
 * https://github.com/lachlanmcdonald/saxicon/
 */
const fs = require('fs');
const path = require('path');
const SaxiconData = require('./SaxiconData');
const { JSDOM } = require('jsdom');
const { TypeTest } = require('./TypeTest');
const { getColorKeyword, isColorKeyword } = require('./Colors');

const COLOR_SPLIT_KEY = '__saxicon__';

class Saxicon {
	constructor(options = {}) {
		// Check options and throw if any do not match the expect values
		Saxicon.validateOptions(options);
		this.options = Object.assign(Saxicon.defaultOptions, options);
	}

	static validateOptions(o = {}) {
		const x = new TypeTest();

		x.isBoolean(o, 'replaceColors');
		x.isBoolean(o, 'removeVersion');
		x.functionReturnsType(o, 'iconName', ['test'], 'string');
		x.isArrayOf(o, 'restrict', 'string');
		x.isArrayOf(o, 'ignore', 'string');
		x.isArrayOf(o, 'presentationTags', 'string');
		x.isArrayOf(o, 'structuralTags', 'string');
		x.isArrayOf(o, 'ignoreTags', 'string');
		x.isNotEmpty(o, 'presentationTags');
		x.isNotEmpty(o, 'structuralTags');
		return x.tests;
	}

	static removeWhitespace(doc) {
		return doc.replace(/>[\r\n\t ]+</gu, '><').trim();
	}

	parseSync(paths) {
		const data = paths.map(svgPath => this.parseFileSync(svgPath));

		return new SaxiconData(data, this.options);
	}

	parseFileSync(svgPath) {
		let width = null;
		let height = null;
		let rootNode = null;
		let doc = null;
		let dom = null;
		let source;

		try {
			source = fs.readFileSync(svgPath, 'utf8');
		} catch (e) {
			return {
				path: svgPath,
				errors: [e],
			};
		}

		// Strip byte-order mark
		if (source.charCodeAt(0) === 0xfeff) {
			source = source.slice(1);
		}

		try {
			dom = new JSDOM(source, {
				contentType: 'text/xml',
			});
			doc = dom.window.document;

			for (let i = 0; i < doc.childNodes.length; i += 1) {
				if (doc.childNodes[i].nodeName === 'svg') {
					rootNode = doc.childNodes[i];
				}
			}
		} catch (e) {
			return {
				path: svgPath,
				errors: [e],
			};
		}

		// Check if the document contains an SVG element
		if (rootNode === null) {
			return {
				path: svgPath,
				errors: [{
					message: 'Document does not contain an <svg> element',
				}],
			};
		}

		// Document size
		const widthAttribute = rootNode.getAttribute('width');
		const heightAttribute = rootNode.getAttribute('height');
		const viewBoxAttribute = rootNode.getAttribute('viewBox');

		if (widthAttribute !== null && heightAttribute !== null) {
			width = parseFloat(widthAttribute);
			height = parseFloat(heightAttribute);
		} else if (viewBoxAttribute !== null) {
			const viewBox = viewBoxAttribute.match(/\d+(?:\.\d+)?/gu);

			if (viewBox !== null && viewBox.length === 4) {
				width = parseFloat(viewBox[2]);
				height = parseFloat(viewBox[3]);
			}
		}

		// Walk nodes
		this.walkChildNodes(rootNode);

		// Remove the version attribute
		if (this.options.removeVersion === true) {
			rootNode.removeAttribute('version');
		}

		// Serialize DOM and remove XML declaration
		let docString = dom.serialize().replace(/<\?xml[^?]+\?>/u, '').trim();

		// Remove insignificant whitespace
		docString = Saxicon.removeWhitespace(docString);

		return {
			components: docString.split(COLOR_SPLIT_KEY),
			iconName: this.options.iconName(svgPath),
			path: svgPath,
			errors: [],
			width,
			height,
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
		const children = node.childNodes;

		if (inherited === null) {
			inherited = {
				fill: null,
				stroke: null,
			};
		}

		for (let i = 0; i < children.length; i += 1) {
			const node = children[i];
			const ignored = this.options.ignoreTags.includes(node.tagName);
			const includeTag = this.options.presentationTags.includes(node.tagName) && ignored === false;
			const structuralTag = this.options.structuralTags.includes(node.tagName) && ignored === false;

			let fillValue = inherited.fill;
			let strokeValue = inherited.stroke;

			if (node.nodeType === 1) {
				if (includeTag || structuralTag) {
					const fillAttribute = node.getAttribute('fill');
					const strokeAttribute = node.getAttribute('stroke');

					fillValue = fillAttribute === null ? fillValue : fillAttribute;
					strokeValue = strokeAttribute === null ? strokeValue : strokeAttribute;

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
							node.setAttribute('fill', COLOR_SPLIT_KEY + fillValue + COLOR_SPLIT_KEY);
						}
					}

					if (isColorKeyword(strokeValue)) {
						if (this.allowedReplacement(strokeValue)) {
							node.setAttribute('stroke', COLOR_SPLIT_KEY + strokeValue + COLOR_SPLIT_KEY);
						}
					}
				}

				if (!ignored) {
					this.walkChildNodes(node, {
						fill: fillValue,
						stroke: strokeValue,
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
	removeVersion: true,
	presentationTags: ['rect', 'circle', 'text', 'ellipse', 'line', 'polyline', 'polygon', 'path'],
	structuralTags: ['g'],
	ignoreTags: ['mask'],
	iconName: sourcePath => path.basename(sourcePath).split('.')[0].trim(),
};

module.exports = Saxicon;
