'use strict';

var gulp        = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('watch', function () {

  runSequence(
    'watch:html',
    'watch:sass',
    'watch:scripts'
  )

});

gulp.task('run', function (cb) {
  runSequence('build', 'watch', 'nodemon', cb);
});
