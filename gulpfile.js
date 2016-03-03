var gulp = require('gulp')
var gutil = require('gulp-util')
var webpack = require('webpack')
var webpackConfig = require('./web/build/webpack.prod.conf.js')
var open = require("gulp-open")
var clean = require('gulp-clean')
var spawn = require('child_process').spawn
var watch = false

gulp.task('clean', function() {
    return gulp.src('./web/dist', {
        read: false
    }).pipe(clean())
})

gulp.task('copy', function () {
    // Copy html
    gulp.src('./web/index.html')
        .pipe(gulp.dest('web/dist'))
})

gulp.task('webpack', function (callback) {
    var myConfig = Object.create(webpackConfig)
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    )
    myConfig.watch = watch

    webpack(myConfig, function (err, stats) {
        if (err) throw new gutil.PluginError('build', err)
        gutil.log('[build]', stats.toString({
            colors: true
        }))
        if (process.platform === 'darwin') {
            spawn('osascript', ['-e', 'display notification "App recompiled" with title "xikbot-web"'])
        }
        if (!watch) {
            callback()
        }
    })
})

// Production build
gulp.task('build', ['clean'], function () {
    gulp.start('copy', 'webpack')
})

gulp.task('watch', ['clean'], function () {
    watch = true
    gulp.start('copy', 'webpack')
})
