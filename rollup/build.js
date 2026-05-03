const path = require('path')
const fs = require('fs')
const json = require('@rollup/plugin-json')
const { babel } = require('@rollup/plugin-babel')

const resolveFile = function (filePath) {
    return path.join(__dirname, filePath)
}

// 复制类型定义文件到 dist 目录
function copyTypescriptDeclarations() {
    const src = resolveFile('../types/index.d.ts')
    const dest = resolveFile('../dist/index.d.ts')
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
        console.log('✓ TypeScript declarations copied to dist/index.d.ts')
    }
}

const plugins = [
    json({
        compact: true,
    }),
    babel({
        extensions: ['.js', '.ts'],
        babelHelpers: 'bundled',
        presets: [[
            '@babel/env',
            {
                targets: {
                    browsers: [
                        '> 1%',
                        'last 2 versions',
                        'not ie <= 8',
                    ],
                },
            },
        ]],
    }),
    {
        name: 'copy-types',
        writeBundle() {
            copyTypescriptDeclarations()
        },
    },
]

module.exports = [
    {
        plugins,
        input: resolveFile('../src/index.js'),
        output: {
            file: resolveFile('../dist/monitor.js'),
            format: 'iife',
            name: 'monitor',
            sourcemap: true,
        },
    },
    {
        plugins,
        input: resolveFile('../src/index.js'),
        output: {
            file: resolveFile('../dist/monitor.esm.js'),
            format: 'esm',
            name: 'monitor',
            sourcemap: true,
        },
    },
    {
        plugins,
        input: resolveFile('../src/index.js'),
        output: {
            file: resolveFile('../dist/monitor.cjs.js'),
            format: 'cjs',
            name: 'monitor',
            sourcemap: true,
        },
    },
]
