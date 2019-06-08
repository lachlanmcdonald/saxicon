module.exports = {
	root: true,
	extends: "eslint:recommended",
	env: {
		node: true,
    	jest: true,
    	es6: true
	},
	rules: {
		// Possible errors
		"no-await-in-loop": "warn",
		"no-control-regex": "warn",
		"no-debugger": "warn",
		"no-empty": "warn",
		"no-extra-boolean-cast": "warn",
		"no-extra-parens": ["warn", "all"],
		"no-template-curly-in-string": "warn",
		"no-unreachable": "warn",

		// Best practises
		"accessor-pairs": ["warn", {
			getWithoutSet: true,
		}],
		"array-callback-return": "error",
		"block-scoped-var": "warn",
		"class-methods-use-this": "warn",
		"consistent-return": "warn",
		"curly": "error",
		"dot-location": ["error", "property"],
		"dot-notation": "warn",
		"eqeqeq": ["error", "smart"],
		"guard-for-in": "warn",
		"max-classes-per-file": ["warn", 1],
		"no-alert": "error",
		"no-caller": "error",
		"no-div-regex": "warn",
		"no-empty-function": "warn",
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "error",
		"no-extra-label": "warn",
		"no-floating-decimal": "warn",
		"no-implicit-coercion": "error",
		"no-implicit-globals": "error",
		"no-implied-eval": "error",
		"no-invalid-this": "error",
		"no-iterator": "error",
		"no-lone-blocks": "error",
		"no-loop-func": "warn",
		"no-multi-spaces": ["error", {
			ignoreEOLComments: true,
		}],
		"no-multi-str": "warn",
		"no-new-func": "error",
		"no-new-wrappers": "warn",
		"no-octal-escape": "error",
		"no-proto": "warn",
		"no-script-url": "error",
		"no-self-compare": "error",
		"no-sequences": "warn",
		"no-throw-literal": "warn",
		"no-unused-expressions": "warn",
		"no-useless-call": "error",
		"no-useless-concat": "warn",
		"no-void": "error",
		"prefer-promise-reject-errors": "warn",
		"radix": "error",
		"require-await": "warn",
		"require-unicode-regexp": "warn",
		"vars-on-top": "warn",
		"wrap-iife": ["error", "outside"],
		"yoda": "error",

		// Variables
		"no-label-var": "error",
		"no-undef-init": "error",
		"no-undefined": "error",
		"no-use-before-define": "warn",

		// Node.js
		"callback-return": "warn",
		"global-require": "error",
		"no-buffer-constructor": "error",
		"no-mixed-requires": "error",
		"no-new-require": "error",
		"no-path-concat": "warn",
		"no-process-exit": "warn",

		// Style
		"array-bracket-newline": ["warn", "consistent"],
		"array-bracket-spacing": ["warn", "never"],
		"array-element-newline": ["warn", "consistent"],
		"block-spacing": ["warn", "always"],
		"brace-style": ["warn", "1tbs", {
			allowSingleLine: true,
		}],
		"camelcase": ["warn", {
			properties: "always",
			ignoreDestructuring: true,
		}],
		"comma-dangle": ["warn", "always-multiline"],
		"comma-spacing": ["warn", {
			before: false,
			after: true
		}],
		"comma-style": ["warn", "last"],
		"computed-property-spacing": ["warn", "never"],
		"consistent-this": "warn",
		"func-call-spacing": ["error", "never"],
		"func-names": ["error", "always"],
		"func-style": ["warn", "expression"],
		"function-paren-newline": ["warn", "never"],
		"implicit-arrow-linebreak": ["error", "beside"],
		"indent": ["warn", "tab"],
		"key-spacing": ["warn", {
			mode: "strict",
			beforeColon: false,
			afterColon: true,
		}],
		"keyword-spacing": ["warn", {
			before: true,
			after: true,
		}],
		"lines-between-class-members": ["warn", "always", {
			exceptAfterSingleLine: true,
		}],
		"max-depth": ["warn", { max: 10 }],
		"max-nested-callbacks": ["warn", { max: 10 }],
		"max-params": ["warn", { max: 10 }],
		"max-statements-per-line": ["warn", { max: 1 }],
		"multiline-ternary": ["warn", "never"],
		"new-cap": ["warn", {
			newIsCap: true,
			capIsNew: false,
			properties: true,
		}],
		"no-array-constructor": "error",
		"no-bitwise": "warn",
		"no-lonely-if": "warn",
		"no-mixed-operators": "warn",
		"no-mixed-spaces-and-tabs": "warn",
		"no-multi-assign": "error",
		"no-multiple-empty-lines": ["error", {
			max: 2,
			maxEOF: 1,
			maxBOF: 0,
		}],
		"no-negated-condition": "warn",
		"no-nested-ternary": "error",
		"no-new-object": "error",
		"no-plusplus": "warn",
		"no-underscore-dangle": ["warn", {
			enforceInMethodNames: false
		}],
		"no-whitespace-before-property": "warn",
		"object-curly-newline": ["warn", {
			multiline: true,
			consistent: true
		}],
		"one-var": ["warn", {
			var: "consecutive",
			let: "never",
			const: "never",
			separateRequires: true,
		}],
		"operator-assignment": ["warn", "always"],
		"operator-linebreak": ["warn", "none"],
		"padded-blocks": ["error", "never"],
		"padding-line-between-statements": [
			"warn",
			{
				blankLine: "always",
				next: "*",
				prev: ["return"],
			}, {
				blankLine: "always",
				prev: ["const", "let", "var"],
				next: "*"
			}, {
				blankLine: "any",
				prev: ["const", "let", "var"],
				next: ["const", "let", "var"]
			}
		],
		"quote-props": ["warn", "consistent-as-needed"],
		"quotes": ["warn", "single", {
			avoidEscape: true,
			allowTemplateLiterals: true,
		}],
		"semi": ["warn", "always"],
		"semi-spacing": ["warn", {
			before: false,
			after: true,
		}],
		"semi-style": ["warn", "last"],
		"space-before-function-paren": ["error", {
			anonymous: "always",
			named: "never",
			asyncArrow: "always",
		}],
		"space-in-parens": ["warn", "never"],
		"space-infix-ops": ["warn"],
		"space-unary-ops": ["warn"],
		"spaced-comment": ["warn", "always"],
		"switch-colon-spacing": ["warn", {
			after: true,
			before: false,
		}],
		"template-tag-spacing": ["warn", "never"],
		"unicode-bom": ["warn", "never"],
		"wrap-regex": 0,

		// ECMAScript 6
		"arrow-body-style": ["warn", "as-needed"],
		"arrow-parens": ["warn", "as-needed"],
		"arrow-spacing": ["warn", {
			before: true,
			after: true,
		}],
		"constructor-super": ["error"],
		"generator-star-spacing": ["error", {
			before: true,
			after: false
		}],
		"no-class-assign": ["error"],
		"no-confusing-arrow": ["error"],
		"no-duplicate-imports": ["warn"],
		"no-this-before-super": ["warn"],
		"no-useless-computed-key": ["warn"],
		"no-useless-constructor": ["warn"],
		"no-var": ["warn"],
		"object-shorthand": ["warn"],
		"prefer-arrow-callback": ["warn"],
		"prefer-const": ["warn"],
		"prefer-numeric-literals": ["warn"],
		"prefer-spread": ["warn"],
		"rest-spread-spacing": ["error", "never"],
	}
};
