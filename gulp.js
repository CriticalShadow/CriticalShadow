var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

// Concat & Minify JS
gulp.task('minify', function () {
  return gulp.src('client/js/*.js')
    .pipe(concat('vagabond.js'))
    .pipe(gulp.dest('client/js'))
    .pipe(rename('vagabond.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('client/js'));
});

gulp.task('default', 'minify');