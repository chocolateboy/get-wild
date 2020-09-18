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
    ],
}
