'use strict';

var gulp        = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('build', function (cb) {
  runSequence( ['clean',
                'jshint'],
              [ 'copy:html',
                'copy:fonts',
                'copy:images',
                'copy:map',
                'sass',
                'scripts'], cb);
});
