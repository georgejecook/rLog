import { series } from "gulp";
const gulp = require('gulp');
const path = require('path');
const del = require('del');
const pkg = require('./package.json');
const distDir = 'dist';
const cp = require('child_process');
const zip = require('gulp-zip');

function clean() {
  const distPath = path.join(distDir, '**');
  console.log('Doing a clean at ' + distPath);
  return del(['dist'], { force: true });
}

function createDirectories() {
  return gulp.src('*.*', { read: false })
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('docs'));
}

function zipToDist() {
  return gulp.src(['src/**/*'], {
    base: 'src'
  }).pipe(zip(`rLog${pkg.version}.zip`))
  .pipe(gulp.dest('./dist'));
}

/**
 * This target is used for CI
 */

export function doc(cb) {
  let task = cp.exec('./node_modules/.bin/jsdoc -r -c jsdoc.json -t node_modules/minami -d docs');
  return task;
}

exports.clean = clean;
exports.doc = series(clean, createDirectories, doc);
exports.dist = series(clean, createDirectories, zipToDist, doc)