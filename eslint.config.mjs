// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import * as path from 'node:path';
import * as url from 'node:url';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    stylistic.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'eslint.config.mjs'
                    ]
                },
                tsconfigRootDir: path.dirname(url.fileURLToPath(import.meta.url))
            }
        },
        rules: {
            '@typescript-eslint/no-unnecessary-condition': [
                'error',
                {
                    allowConstantLoopConditions: 'only-allowed-literals'
                }
            ],
            '@stylistic/quotes': [
                'error',
                'single',
                {
                    allowTemplateLiterals: 'avoidEscape'
                }
            ],
            '@stylistic/indent': [
                'error',
                4,
                {
                    SwitchCase: 1
                }
            ],
            '@stylistic/comma-dangle': [
                'error',
                'never'
            ],
            '@stylistic/quote-props': [
                'error',
                'as-needed'
            ],
            '@stylistic/semi': [
                'error',
                'always'
            ],
            '@stylistic/eol-last': [
                'error',
                'never'
            ],
            '@stylistic/lines-between-class-members': 'off',
            '@stylistic/object-curly-spacing': 'off',
            '@stylistic/brace-style': [
                'error',
                '1tbs'
            ],
            eqeqeq: 'error'
        }
    },
    {
        ignores: [
            'build/',
            'node_modules/'
        ]
    },
    {
        files: [
            'src/test/**/*'
        ],
        rules: {
            '@typescript-eslint/no-floating-promises': 'off'
        }
    }
);