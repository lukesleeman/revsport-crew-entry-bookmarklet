const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');

class BookmarkletPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('BookmarkletPlugin', (compilation) => {
      const outputPath = path.resolve(__dirname, 'dist');
      const jsFile = path.join(outputPath, 'bookmarklet.js');
      const readmePath = path.resolve(__dirname, 'README.md');
      
      if (fs.existsSync(jsFile) && fs.existsSync(readmePath)) {
        const jsContent = fs.readFileSync(jsFile, 'utf8');
        const bookmarkletUrl = `javascript:${encodeURIComponent(jsContent)}`;
        
        let readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Replace the manual installation code block
        readmeContent = readmeContent.replace(
          /(<!-- BOOKMARKLET_CODE_START -->\n```\n)[\s\S]*?(\n```\n<!-- BOOKMARKLET_CODE_END -->)/,
          `$1${bookmarkletUrl}$2`
        );
        
        fs.writeFileSync(readmePath, readmeContent);
        console.log('✅ README.md updated with current bookmarklet');
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
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
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