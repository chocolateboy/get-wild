import dts from 'rollup-plugin-dts'

const config = [
    {
        input: './dist/index.d.ts',
        output: [
            {
                file: './index.d.ts',
                format: 'es',
            }
        ],
        plugins: [dts()],
    },
    {
        input: './dist/fp.d.ts',
        output: [
            {
                file: './fp.d.ts',
                format: 'es',
            }
        ],
        plugins: [dts()],
    },
]

export default config
