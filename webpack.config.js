const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');

class BookmarkletPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('BookmarkletPlugin', (compilation) => {
      const outputPath = path.resolve(__dirname, 'dist');
      const jsFile = path.join(outputPath, 'bookmarklet.js');
      const bookmarkletFile = path.join(outputPath, 'bookmarklet.md');
      const templateFile = path.join(__dirname, 'templates', 'bookmarklet.md');
      
      if (fs.existsSync(jsFile) && fs.existsSync(templateFile)) {
        const jsContent = fs.readFileSync(jsFile, 'utf8');
        const bookmarkletUrl = `javascript:${encodeURIComponent(jsContent)}`;
        
        const templateContent = fs.readFileSync(templateFile, 'utf8');
        const markdownContent = templateContent.replace(/{{BOOKMARKLET_URL}}/g, bookmarkletUrl);
        
        fs.writeFileSync(bookmarkletFile, markdownContent);
      }
    });
  }
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bookmarklet.js',
    library: {
      type: 'var',
      name: 'bookmarklet'
    }
  },
  plugins: [
    new BookmarkletPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: true
        }
      })
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};