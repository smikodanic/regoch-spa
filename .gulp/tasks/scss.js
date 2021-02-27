/**
 * SCSS compiler
 * Compiles SCSS files into CSS.
 * Creating .map files.
 * Creating .min files.
 */
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer'); //add vendor prefixes: -webkit-, -moz-, -o-,
const sourcemaps = require('gulp-sourcemaps'); //create .map files for scss debugging in browser
const cssmin = require('gulp-cssmin'); //create .min files
const rename = require('gulp-rename');

// header - banner
const header = require('gulp-header');
const pkg = require('../../package.json');
const banner = ['/*!\n',
  ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2014-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> \n',
  ' */\n\n'];
banner.join();



// compile scss to css files and
// create .map files foer easier debugging of scss files
const compile = async () => {
  gulp.src('client/src/application/scss/index.scss')
    .pipe(sourcemaps.init())
    // .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sass())
    .pipe(header(banner, {pkg: pkg}))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/dist/css'));
};


// create .min files
const minify = async () => {
  gulp.src('client/dist/css/*.css')
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('client/dist/css'));
};


module.exports = async () => {
  await compile();
  await minify();
};
