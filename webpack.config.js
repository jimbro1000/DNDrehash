const {resolve} = require('path');
module.exports = {
  entry: './src/dnd1.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: 'production',
}