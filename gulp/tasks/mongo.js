var gulp = require('gulp'),
    exec = require('child_process').exec;

gulp.task('mongod', function (cb) {
    exec('mongod --dbpath /data/db', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});