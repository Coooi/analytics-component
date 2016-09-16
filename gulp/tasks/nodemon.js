var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint')

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})

gulp.task('nodemon', function () {
  nodemon({ script: 'server.js',
            tasks: ['jshint'],
            ignore: ['public/**/*']})
    .on('restart', function () {
      console.log('Server restarted!');
    })
});
