var gulp, vendor, concat, uglify, jshint, config, ngAnnotate;

config  = require('../config');
gulp    = require('gulp');
vendor  = require('gulp-concat-vendor');
concat  = require('gulp-concat');
uglify  = require('gulp-uglify');
jshint  = require('gulp-jshint');
ngAnnotate = require('gulp-ng-annotate');

gulp.task('default', function () {
    return gulp.src('src/app.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest('dist'));
});


gulp.task('concat-vendor', function() {
  gulp.src(config.vendorScripts)
  .pipe(vendor('vendor.min.js'))
  .pipe(gulp.dest('public/js/'));
});

gulp.task('uglify', function() {
  return gulp.src(config.devScripts)
    .pipe(ngAnnotate())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('app/temp/js'))
    // .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('public/js/'));
});

gulp.task('jshint', function() {
  return gulp.src(config.devScripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['concat-vendor','uglify']);
