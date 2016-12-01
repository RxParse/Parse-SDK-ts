var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('default', function () {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            declaration: true,
            target:"es5"
        }))
        .pipe(gulp.dest('dist'));
});