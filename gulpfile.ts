import { series } from "gulp";
const concat = require('gulp-concat');
const gulp = require('gulp');
const path = require('path');
const del = require('del');
const header = require('gulp-header');
const pkg = require('./package.json');
const distDir = 'dist';
const fs = require('fs');
const gulpCopy = require('gulp-copy');
const cp = require('child_process');

export function clean() {
  const distPath = path.join(distDir, '**');
  console.log('Doing a clean at ' + distPath);
  return del(['dist'], { force: true });
}

function createDirectories() {
  return gulp.src('src', { read: false })
    .pipe(gulp.dest('dist'))
}

/**
 * This target is used for CI
 */

export function doc(cb) {
  let task = cp.exec('./node_modules/.bin/jsdoc -c jsdoc.json -t node_modules/minami -d docs');
  return task;
}

exports.doc = series(doc);
exports.runFrameworkTests = series(exports.build, prepareFrameworkTests, zipFrameworkTests, deployFrameworkTests)
exports.prePublishFrameworkTests = series(exports.build, prepareFrameworkTests)