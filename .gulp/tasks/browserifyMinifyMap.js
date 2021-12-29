/**
 * - browserify
 * - creates minified JS file
 * - creates JS map file
 */
const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const minify = require('gulp-minify');
const sourcemaps = require('gulp-sourcemaps');


// header - banner
const header = require('gulp-header');
const pkg = require('../../package.json');
const banner = ['/*!\n',
  ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2014-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> \n',
  ' */\n\n'];
banner.join();


module.exports = async () => {
  browserify('./client/src/app.js')
    .ignore('http')
    .ignore('fs')
    .ignore('path')
    .ignore('zlib')
    .ignore('os')
    .ignore('puppeteer')
    .bundle()
    .on('error', (err) => {
      console.log('Browserify Error::', err.message);
    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(header(banner, { pkg: pkg }))
    // .pipe(minify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./client/_dist/js'));
};
