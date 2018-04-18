# saxicon

[![npm version](https://badge.fury.io/js/saxicon.svg)](https://badge.fury.io/js/saxicon)
[![Build Status](https://travis-ci.org/lachlanmcdonald/saxicon.svg?branch=master)](https://travis-ci.org/lachlanmcdonald/saxicon)

> The **saxicon** module transforms SVGs into a SASS snippet that allows you to generate colorized SVGs (with both single or multi-colored shapes) within SASS, with each SVG embedded as a data-URI.

🌱 *This is a beta release, use with care!*

Saxicon is useful when you want to:

1. Colorise your SVGs into a number of different colors, where these colors are embedded in your SCSS as a data-URI. For example, for theming support or reducing the overhead of manually editing SVG icons to match changes to your styleguide.
2. When you want to store your SVGs in CSS, and directly embedding them in your HTML is not applicable. For example, when working with a CMS.

**Features**

- Significantly faster than [grunt-icon](https://github.com/filamentgroup/grunticon) or plugins for inlining SVGs with PostCSS.
- Robust unit and visual tests
- Works with [libsass](https://sass-lang.com/LibSass) and Dart Sass (replaces Ruby Sass)

**Task runners:**

- [grunt-saxicon](https://github.com/lachlanmcdonald/grunt-saxicon)

**Documentation**

- [Documentation](https://github.com/lachlanmcdonald/saxicon/wiki/)
- [Issue Tracking](https://github.com/lachlanmcdonald/saxicon/issues)

## Quick start

```js
const { Saxicon } = require('saxicon');

// Initialise a new Saxicon instance
const sax = new Saxicon();

// Parse SVG files
const result = sax.parse([
    'path/to/icon1.svg',
    'path/to/icon2.svg',
    'path/to/icon3.svg',
]);

// Write SCSS to file
fs.writeFile('saxicon.scss', result.scss(), (err) => {
    if (err) {
        throw new Error(err);
    }
});
```

Then in your SCSS:

```scss
.icon1 {
    background-image: sax(icon1, #F00);
}
```

Will compile to:

```css
.red-arrow {
    background-image: url("data:image/svg+xml,...");
}
```
