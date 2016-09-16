'use strict';

var minifyCss = require('gulp-minify-css');
var config    = require('../config');
var concat    = require('gulp-concat');
var sass      = require('gulp-sass');
var gulp      = require('gulp');

gulp.task('sass', function () {
  return gulp.src(config.sassPath)
          .pipe(sass().on('error', sass.logError))
          .pipe(minifyCss({keepSPecialComments: 0}))
          .pipe(concat('app.min.css'))
          .pipe(gulp.dest(config.distCSS));
})
