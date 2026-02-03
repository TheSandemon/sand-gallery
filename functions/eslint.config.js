const globals = require("globals");
const pluginJs = require("@eslint/js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            ecmaVersion: 2022,
            sourceType: "commonjs"
        }
    },
    pluginJs.configs.recommended,
    {
        rules: {
            "no-unused-vars": "off",
            "no-undef": "off",
            "no-redeclare": "off",
            "no-empty": "off",
            "prefer-const": "off"
        }
    }
];
