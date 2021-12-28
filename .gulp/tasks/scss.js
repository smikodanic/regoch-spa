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


// compile scss to css files and create .map files for easier debugging of scss files
const compile = async () => {
  gulp.src('client/src/styles/app.scss')
    .on('error', err => { console.log('SCSS Error::', err.message); })
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sass())
    // .pipe(sass({outputStyle: 'compressed'}))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/_dist/styles'));
};


// create app.min.css file
const minify = async () => {
  await gulp.src('client/_dist/styles/app.css')
    .on('error', err => { console.log('SCSS Error::', err.message); })
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('client/_dist/styles'));
};


module.exports = async () => {
  await compile();
  await new Promise(resolve => setTimeout(resolve, 700));
  await minify();
};
