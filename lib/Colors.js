/*
 * saxicon 1.0.0
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

// Shim Object.values for Node 6.x
if (!Object.values) {
	require('object.values').shim();
}

// See: https://www.w3.org/TR/SVG11/types.html#ColorKeywords
const COLOR_LOOKUP = {
	'000': 'black',
	'000080': 'navy',
	'00008B': 'darkblue',
	'0000CD': 'mediumblue',
	'00F': 'blue',
	'006400': 'darkgreen',
	'008000': 'green',
	'008080': 'teal',
	'008B8B': 'darkcyan',
	'00BFFF': 'deepskyblue',
	'00CED1': 'darkturquoise',
	'00FA9A': 'mediumspringgreen',
	'0F0': 'lime',
	'00FF7F': 'springgreen',
	'0FF': 'cyan',
	'191970': 'midnightblue',
	'1E90FF': 'dodgerblue',
	'20B2AA': 'lightseagreen',
	'228B22': 'forestgreen',
	'2E8B57': 'seagreen',
	'2F4F4F': 'darkslategrey',
	'32CD32': 'limegreen',
	'3CB371': 'mediumseagreen',
	'40E0D0': 'turquoise',
	'4169E1': 'royalblue',
	'4682B4': 'steelblue',
	'483D8B': 'darkslateblue',
	'48D1CC': 'mediumturquoise',
	'4B0082': 'indigo',
	'556B2F': 'darkolivegreen',
	'5F9EA0': 'cadetblue',
	'6495ED': 'cornflowerblue',
	'66CDAA': 'mediumaquamarine',
	'696969': 'dimgrey',
	'6A5ACD': 'slateblue',
	'6B8E23': 'olivedrab',
	'708090': 'slategrey',
	'789': 'lightslategrey',
	'7B68EE': 'mediumslateblue',
	'7CFC00': 'lawngreen',
	'7FFF00': 'chartreuse',
	'7FFFD4': 'aquamarine',
	'800000': 'maroon',
	'800080': 'purple',
	'808000': 'olive',
	'808080': 'grey',
	'87CEEB': 'skyblue',
	'87CEFA': 'lightskyblue',
	'8A2BE2': 'blueviolet',
	'8B0000': 'darkred',
	'8B008B': 'darkmagenta',
	'8B4513': 'saddlebrown',
	'8FBC8F': 'darkseagreen',
	'90EE90': 'lightgreen',
	'9370DB': 'mediumpurple',
	'9400D3': 'darkviolet',
	'98FB98': 'palegreen',
	'9932CC': 'darkorchid',
	'9ACD32': 'yellowgreen',
	'A0522D': 'sienna',
	'A52A2A': 'brown',
	'A9A9A9': 'darkgrey',
	'ADD8E6': 'lightblue',
	'ADFF2F': 'greenyellow',
	'AFEEEE': 'paleturquoise',
	'B0C4DE': 'lightsteelblue',
	'B0E0E6': 'powderblue',
	'B22222': 'firebrick',
	'B8860B': 'darkgoldenrod',
	'BA55D3': 'mediumorchid',
	'BC8F8F': 'rosybrown',
	'BDB76B': 'darkkhaki',
	'C0C0C0': 'silver',
	'C71585': 'mediumvioletred',
	'CD5C5C': 'indianred',
	'CD853F': 'peru',
	'D2691E': 'chocolate',
	'D2B48C': 'tan',
	'D3D3D3': 'lightgrey',
	'D8BFD8': 'thistle',
	'DA70D6': 'orchid',
	'DAA520': 'goldenrod',
	'DB7093': 'palevioletred',
	'DC143C': 'crimson',
	'DCDCDC': 'gainsboro',
	'DDA0DD': 'plum',
	'DEB887': 'burlywood',
	'E0FFFF': 'lightcyan',
	'E6E6FA': 'lavender',
	'E9967A': 'darksalmon',
	'EE82EE': 'violet',
	'EEE8AA': 'palegoldenrod',
	'F08080': 'lightcoral',
	'F0E68C': 'khaki',
	'F0F8FF': 'aliceblue',
	'F0FFF0': 'honeydew',
	'F0FFFF': 'azure',
	'F4A460': 'sandybrown',
	'F5DEB3': 'wheat',
	'F5F5DC': 'beige',
	'F5F5F5': 'whitesmoke',
	'F5FFFA': 'mintcream',
	'F8F8FF': 'ghostwhite',
	'FA8072': 'salmon',
	'FAEBD7': 'antiquewhite',
	'FAF0E6': 'linen',
	'FAFAD2': 'lightgoldenrodyellow',
	'FDF5E6': 'oldlace',
	'F00': 'red',
	'F0F': 'magenta',
	'FF1493': 'deeppink',
	'FF4500': 'orangered',
	'FF6347': 'tomato',
	'FF69B4': 'hotpink',
	'FF7F50': 'coral',
	'FF8C00': 'darkorange',
	'FFA07A': 'lightsalmon',
	'FFA500': 'orange',
	'FFB6C1': 'lightpink',
	'FFC0CB': 'pink',
	'FFD700': 'gold',
	'FFDAB9': 'peachpuff',
	'FFDEAD': 'navajowhite',
	'FFE4B5': 'moccasin',
	'FFE4C4': 'bisque',
	'FFE4E1': 'mistyrose',
	'FFEBCD': 'blanchedalmond',
	'FFEFD5': 'papayawhip',
	'FFF0F5': 'lavenderblush',
	'FFF5EE': 'seashell',
	'FFF8DC': 'cornsilk',
	'FFFACD': 'lemonchiffon',
	'FFFAF0': 'floralwhite',
	'FFFAFA': 'snow',
	'FF0': 'yellow',
	'FFFFE0': 'lightyellow',
	'FFFFF0': 'ivory',
	'FFF': 'white'
};

const KEYWORK_LOOKUP = Object.values(COLOR_LOOKUP).concat([
	'aqua',
	'darkslategray',
	'dimgray',
	'slategray',
	'lightslategray',
	'gray',
	'darkgray',
	'lightgray'
]);

exports.getColorKeyword = (input) => {
	if (typeof input === 'string') {
		let color = input.replace(/^#/, '').toUpperCase();

		if (COLOR_LOOKUP.hasOwnProperty(color)) {
			return COLOR_LOOKUP[color];
		} else if (/^([A-F0-9])\1([A-F0-9])\2([A-F0-9])\3$/i.test(color)) {
			color = color[0] + color[2] + color[4];
			if (COLOR_LOOKUP.hasOwnProperty(color)) {
				return COLOR_LOOKUP[color];
			}
		}
	}

	return input;
};

exports.isColorKeyword = (input) => {
	return typeof input === 'string' ? KEYWORK_LOOKUP.includes(input.toLowerCase()) : false;
};
