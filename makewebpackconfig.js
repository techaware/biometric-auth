var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AppCachePlugin = require('appcache-webpack-plugin');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'js', 'app.js');

module.exports = function(options) {
  var entry, jsLoaders, plugins, cssLoaders, devtool;

  // If production is true
  if (options.prod) {
    devtool = 'cheap-module-source-map';
    // Entry
    entry = [
      // path.resolve(__dirname, 'js/app.js') // Start with js/app.js...
        mainPath
    ];
    // cssLoaders = ['file-loader?name=[path][name].[ext]', 'postcss-loader'];
    // cssLoaders = ['file-loader?name=[path][name].[ext]', 'postcss-loader'];
    cssLoaders = ['style-loader',{loader:'css-loader'}, 'postcss-loader'];
    // Plugins
    plugins = [// Plugins for Webpack
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.UglifyJsPlugin({ // Optimize the JavaScript...
        compress: {
          warnings: false // ...but do not show warnings in the console (there is a lot of them)
        }
      }),
      new HtmlWebpackPlugin({
        template: 'index.html', // Move the index.html file...
        minify: { // Minifying it while it is parsed using the following, self–explanatory options
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        }
      }),
      new webpack.LoaderOptionsPlugin({
        // test: /\.xxx$/, // may apply this only for some modules
        options: {
          // minimize: true,
          // debug: true,
          postcss: function() {
            return [
              require('postcss-import')({ // Import all the css files...
                onImport: function (files) {
                    files.forEach(this.addDependency); // ...and add dependecies from the main.css files to the other css files...
                }.bind(this) // ...so they get hot–reloaded when something changes...
              }),
              require('postcss-simple-vars')(), // ...then replace the variables...
              require('postcss-focus')(), // ...add a :focus to ever :hover...
              require('autoprefixer')({ // ...and add vendor prefixes...
                browsers: ['last 2 versions', 'IE > 8'] // ...supporting the last 2 major browser versions and IE 8 and up...
              }),
              require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
                clearMessages: true
              })
            ];
          }
        }
      })
      // new AppCachePlugin({
      //   exclude: ['.htaccess']
      // })
    ];

  // If app is in development
  } else {
    devtool = 'cheap-eval-source-map';
    // Entry
    entry = [
      "webpack-dev-server/client?http://localhost:8080", // Needed for hot reloading
      "webpack/hot/only-dev-server", // See above
      // path.resolve(__dirname, 'js/app.js') // Start with js/app.js...
        mainPath
    ];
    cssLoaders = ['style-loader',{loader:'css-loader'}, 'postcss-loader'];
    // Only plugin is the hot module replacement plugin
    plugins = [
      new webpack.HotModuleReplacementPlugin(), // Make hot loading work
      // new AppCachePlugin()
      new webpack.LoaderOptionsPlugin({
        // test: /\.xxx$/, // may apply this only for some modules
        options: {
          postcss: function() {
            return [
              require('postcss-import')({ // Import all the css files...
                onImport: function (files) {
                  files.forEach(this.addDependency); // ...and add dependecies from the main.css files to the other css files...
                }.bind(this) // ...so they get hot–reloaded when something changes...
              }),
              require('postcss-simple-vars')(), // ...then replace the variables...
              require('postcss-focus')(), // ...add a :focus to ever :hover...
              require('autoprefixer')({ // ...and add vendor prefixes...
                browsers: ['last 2 versions', 'IE > 8'] // ...supporting the last 2 major browser versions and IE 8 and up...
              }),
              require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
                clearMessages: true
              })
            ];
          }
        }
      })
    ]
  }

  return {
    devtool: devtool,
    entry: entry,
    output: { // Compile into js/build.js
      // path: path.resolve(__dirname, 'build'),
      path:buildPath,
      // filename: "js/bundle.js"
      filename:"bundle.js",
      // Everything related to Webpack should go through a build path,
      // localhost:3000/build. That makes proxying easier to handle
      publicPath: '/build/'
    },
    module: {
      rules: [{
          test: /\.js$/, // Transform all .js files required somewhere within an entry point...
          use: 'babel-loader', // ...with the specified loaders...
          exclude: path.join(__dirname, '/node_modules/') // ...except for the node_modules folder.
        }, {
          test:   /\.css$/, // Transform all .css files required somewhere within an entry point...
          use: cssLoaders // ...with PostCSS
        }, {
          test: /\.jpe?g$|\.gif$|\.png$/i,
          use: "url-loader?limit=10000"
        },
        {
          test: /\.jpg$/,
          use: [ 'file-loader' ]
        }
        // {test: /\.json$/,
        //   loader: 'json-loader'}
      ]
    },
    plugins: plugins,
    // postcss: function() {
    //   return [
    //     require('postcss-import')({ // Import all the css files...
    //       onImport: function (files) {
    //           files.forEach(this.addDependency); // ...and add dependecies from the main.css files to the other css files...
    //       }.bind(this) // ...so they get hot–reloaded when something changes...
    //     }),
    //     require('postcss-simple-vars')(), // ...then replace the variables...
    //     require('postcss-focus')(), // ...add a :focus to ever :hover...
    //     require('autoprefixer')({ // ...and add vendor prefixes...
    //       browsers: ['last 2 versions', 'IE > 8'] // ...supporting the last 2 major browser versions and IE 8 and up...
    //     }),
    //     require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
    //       clearMessages: true
    //     })
    //   ];
    // },
    resolve: {
      // modules: path.join(__dirname, 'node_modules')
      // modules: ["node_modules"]
    },
    target: "web", // Make web variables accessible to webpack, e.g. window
    node: {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    stats: false // Don't show stats in the console
    // progress: true
  }
}
