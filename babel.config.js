module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { regenerator: true }],
    '@babel/plugin-syntax-import-attributes'
  ],
  overrides: [
    {
      test: /node_modules\/ansi-color/,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, loose: true }]
      ]
    }
  ]
};