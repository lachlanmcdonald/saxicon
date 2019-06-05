module.exports = {
	root: true,
	extends: "eslint:recommended",
	env: {
		node: true,
    	jest: true,
    	es6: true
	},
	rules: {
		'no-debugger': 'error',
		'no-useless-escape': 'warn',
		'no-bitwise': 'error',
		'camelcase': ['error', {
			properties: 'never'
		}],
		'curly': ['error', 'all'],
		'eqeqeq': ['error', 'always', {
			'null': 'ignore'
		}],
		'guard-for-in': 'error',
		'wrap-iife': ['error', 'any'],
		'no-use-before-define': 'error',
		'new-cap': 'error',
		'no-caller': 'error',
		'no-empty': ['error', {
			allowEmptyCatch: true
		}],
		'no-plusplus': ['error', {
			allowForLoopAfterthoughts: true
		}],
		'quotes': ['error', 'single'],
		'no-undef': 'error',
		'no-unused-vars': 'warn',
		'semi': 'error',
		'space-before-function-paren': ['error', 'never'],
		'array-bracket-spacing': ['error', 'never'],
		'space-in-parens': ['error', 'never'],
		'quote-props': ['error', 'consistent-as-needed'],
		'key-spacing': ['error', {
			beforeColon: false,
			afterColon: true
		}],
		'space-unary-ops': ['error', {
			words: false,
			nonwords: false
		}],
		'no-mixed-spaces-and-tabs': 'error',
		'no-trailing-spaces': 'error',
		'comma-dangle': ['error', 'never'],
		'yoda': ['error', 'never'],
		'no-with': 'error',
		'no-multiple-empty-lines': 'error',
		'space-before-blocks': ['error', 'always'],
		'one-var': 'off',
		'comma-style': ['error', 'last'],
		'space-infix-ops': 'error',
		'eol-last': 'error',
		'dot-notation': 'error',
		'keyword-spacing': ['error', {}],
		'consistent-this': ['error', '_this'],
		'linebreak-style': ['error', 'unix'],
		'indent': ['error', 'tab', {
			SwitchCase: 1
		}],
		'brace-style': ['warn', '1tbs', {
			allowSingleLine: true
		}]
	}
};
