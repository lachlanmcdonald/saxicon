# 🎷 saxicon

[![npm version](https://badge.fury.io/js/saxicon.svg)](https://badge.fury.io/js/saxicon)
[![License](https://img.shields.io/npm/l/saxicon.svg)](https://github.com/lachlanmcdonald/saxicon/blob/master/LICENSE)

> The **saxicon** module transforms SVGs into a SASS snippet that allows you to generate colorized SVGs (with both single or multi-colored shapes) within SASS, with each SVG embedded as a data-URI.

<p style="color: red;"><b>Deprecation warning</b>: This module is no longer maintained and will not receive any further security updates or fixes.</p>

Saxicon is useful when you want to:

1. Colorise your icon SVGs into a number of different colors, where these icons are embedded in your SCSS as a data-URI. For example, for theming support or reducing the overhead of manually editing icons to match changes to your styleguide.
2. When you want to store your SVGs in CSS, and directly embedding them in your HTML is not applicable. For example, when working with a CMS.

**Features**

- Significantly faster than [grunt-icon](https://github.com/filamentgroup/grunticon) or plugins for inlining SVGs with PostCSS.
- Robust unit and visual tests

**Task runners:**

- [grunt-saxicon](https://github.com/lachlanmcdonald/grunt-saxicon)

**Documentation**

- [Documentation](https://github.com/lachlanmcdonald/saxicon/wiki/)
- [Issue Tracking](https://github.com/lachlanmcdonald/saxicon/issues)

## Quick start

```js
const fs = require('fs');
const { Saxicon } = require('saxicon');

// Initialise a new Saxicon instance
const sax = new Saxicon();

// Parse a single SVG file
sax.parseSync('path/to/icon1.svg');

// Parse multiple SVG files
sax.parseSync([
    'path/to/icon2.svg',
    'path/to/icon3.svg',
]);

// Parse a string as a SVG file 
sax.parseString(someMarkup);

// Write SCSS to file
fs.writeFile('saxicon.scss', sax.scss(), (err) => {
    if (err) {
        throw new Error(err);
    }
});
```

Then in your SCSS:

```scss
@import 'saxicon';

.icon1 {
    background-image: sax(icon1, #F00);
}
```

Will compile to:

```css
.icon1 {
    background-image: url("data:image/svg+xml,...");
}
```
