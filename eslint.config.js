const globals = require("globals");
const tseslint = require("typescript-eslint");

import eslintPluginPrettier from 'eslint-plugin-prettier';

import { rules as configPrettierRules } from 'eslint-config-prettier';
import { rules as configPrettierOverridesRules } from 'eslint-config-prettier/prettier';


module.exports = [
    {files: ["**/*.{ts,tsx}"]},
    {languageOptions: {globals: globals.commonjs}},
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            ...configPrettierRules,
            ...configPrettierOverridesRules,
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    endOfLine: 'auto',
                },
                {
                    usePrettierrc: false,
                },
            ],
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    {
        rules: {
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    "allowShortCircuit": true,
                    "allowTernary": true,
                    "allowTaggedTemplates": true
                }
            ],
            "@/comma-spacing": "error",
            "@/no-extra-semi": "error",
            "@/lines-between-class-members": "error",
            "@typescript-eslint/default-param-last": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "args": "none"
                }
            ]
        }
    }
];
