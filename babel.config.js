module.exports = {
    env: {
        development: {
            sourceMaps: true,
            plugins: ['source-map-support'],
        }
    },

    plugins: [
        'codegen'
    ],

    presets: [
        'bili/babel',
        // ['@babel/preset-env', { debug: true, useBuiltIns: 'usage', corejs: 3 }],
    ],
}
