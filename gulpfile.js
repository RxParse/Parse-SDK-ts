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

var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json", {
    include: [
        "src/**/*"
    ]
});

gulp.task("default", function () {
    return gulp.src("src/**/*")
        .pipe(tsProject())
        .pipe(gulp.dest("dist"));
});