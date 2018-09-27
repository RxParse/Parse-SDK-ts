"use strict";

var gulp = require("gulp");
var jsdoc = require('gulp-jsdoc3');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json", {});

gulp.task("source", function () {
    return gulp.src("src/**/*")
        .pipe(tsProject())
        .pipe(gulp.dest("dist"));
});

gulp.task('releaseCopy', function () {
    return gulp.src('package.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('devCopy', function () {
    return gulp.src('package.json')
        .pipe(gulp.dest('.bin/src'));
});

gulp.task('doc', gulp.series('source', function (done) {
    gulp.src(['README.md', './dist/**/*.js'], {
            read: false
    }).pipe(jsdoc(done));    
}));

gulp.task('default', gulp.series(gulp.parallel('source', 'releaseCopy'), function (done) {
    done();
}));

gulp.task('dev', gulp.series(gulp.parallel('source', 'devCopy'), function (done) {
    done();
}));

gulp.task('docs', gulp.series(gulp.parallel('source', 'doc'), function (done) {
    done();
}));