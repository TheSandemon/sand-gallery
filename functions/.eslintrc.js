module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    rules: {
        "quotes": "off",
        "indent": "off",
        "max-len": "off",
        "object-curly-spacing": "off",
        "comma-dangle": "off",
        "require-jsdoc": "off",
        "valid-jsdoc": "off",
        "camelcase": "off",
        "padded-blocks": "off",
        "arrow-parens": "off",
        "eol-last": "off",
        "no-trailing-spaces": "off",
        "no-unused-vars": "warn",
        "spaced-comment": "off",
        "no-multi-spaces": "off",
        "curly": "off",
        "guard-for-in": "off",
        "prefer-const": "off",
        "operator-linebreak": "off"
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
};
