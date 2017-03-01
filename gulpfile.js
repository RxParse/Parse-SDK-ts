// var gulp = require('gulp');
// var ts = require('gulp-typescript');

// gulp.task('default', function () {
//     return gulp.src('src/**/*.ts')
//         .pipe(ts({
//             declaration: true,
//             target: "es5"
//         }))
//         .pipe(gulp.dest('dist'));
// });
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
        .pipe(gulp.dest('out/src'));
});

gulp.task('doc', ['source'], function (cb) {
    //var config = require('./jsdoc.json');
    gulp.src(['README.md', './dist/**/*.js'], { read: false })
        .pipe(jsdoc(cb));
});

gulp.task('default', ['source', 'releaseCopy']);

gulp.task('dev', ['source', 'devCopy']);

gulp.task('docs', ['source', 'doc']);