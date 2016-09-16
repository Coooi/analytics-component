'use strict';

var gulp = require('gulp');
var flatten = require('gulp-flatten');

gulp.task('copy:html', function () {

  return gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./public/'));

});

gulp.task('copy:angular', function () {
    return gulp.src('./bower_components/angular/angular.min.js')
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('copy:map', function () {
    return gulp.src('./bower_components/**/*.min.js.map')
        .pipe(flatten())
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('copy:images', function () {
  return gulp.src([
        'app/img/*'
    ])
    .pipe(gulp.dest('./public/img/'));
});

gulp.task('copy:fonts', function () {
    return gulp.src('app/fonts/*')
        .pipe(gulp.dest('./public/fonts/'));
});
