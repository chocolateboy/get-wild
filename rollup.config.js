import size       from 'rollup-plugin-filesize'
import { terser } from 'rollup-plugin-terser'
import ts         from '@wessberg/rollup-plugin-ts'

const isDevEnv = process.env.NODE_ENV !== 'production'
const $size = size({ showMinifiedSize: false })

const $ts = ts({
    transpiler: 'babel',
})

const $tsMap = ts({
    transpiler: 'babel',
    babelConfig: {
        plugins: ['source-map-support'],
    }
})

const $terser = terser({
    ecma: 2015,
    compress: { passes: 2 },
    mangle: true,
})

const cjs = entry => {
    const [external, plugins] = isDevEnv
        ? [['source-map-support/register'], [$tsMap]]
        : [[], [$ts]]

    return {
        external,
        input: `src/${entry}.ts`,
        plugins,
        output: {
            file: `dist/${entry}.js`,
            format: 'cjs',
            sourcemap: isDevEnv,
        },
    }
}

const release = entry => ({
    input: `src/${entry}.ts`,
    plugins: [$ts],
    output: [
        {
            file: `dist/${entry}.esm.js`,
            format: 'esm',
        },
        {
            file: `dist/${entry}.umd.js`,
            format: 'umd',
            name: 'GetWild',
        },
        {
            file: `dist/${entry}.umd.min.js`,
            format: 'umd',
            name: 'GetWild',
            plugins: [$terser, $size],
        },

        // this is just for information: it's not packaged
        {
            file: `dist/data/${entry}.esm.min.js`,
            format: 'esm',
            plugins: [$terser, $size],
        }
    ]
})

const config = [cjs('index'), cjs('fp')]

if (!isDevEnv) {
    config.push(release('index'), release('fp'))
}

export default config
