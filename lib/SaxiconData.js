const fs = require('fs');
const path = require('path');
const { isColorKeyword } = require('./Colors');

class SaxiconData {
	constructor(data, options = {}) {
		this.data = data;
		this.options = options;
	}

	get errors() {
		return this.data.filter(x => x.errors.length > 0);
	}

	get exportable() {
		return this.data.filter(x => x.errors.length === 0);
	}

	uri() {
		return this.data.map(set => 'data:image/svg+xml,' + set.components.map(x => SaxiconData.encode(x)).join(''));
	}

	scss() {
		const scssUtils = fs.readFileSync(path.join(__dirname, 'saxicon.scss'), 'utf8');
		const mapVariable = `$saxicon-map-${Number(new Date())}`;
		const map = [];

		this.exportable.forEach(set => {
			set.svg = set.components.map(x => {
				if (isColorKeyword(x)) {
					return x;
				} else {
					return `"${SaxiconData.encode(x)}"`;
				}
			}).join(', ');

			map.push('"' + set.iconName + '": (' + set.width + ', ' + set.height + ', (' + set.svg + '))');
		});

		return `${scssUtils}
			${mapVariable}: (${map.join(',\n')});
			$saxicon-map: map_merge($saxicon-map, ${mapVariable});
		`;
	}

	static encode(s) {
		return s.replace(/[^ \-.\d\w=:/]/gu, escape).replace(/"/gu, '\'').replace(/%u([a-f0-9]{4})/gui, '%26%23x$1;');
	}
}

module.exports = SaxiconData;
