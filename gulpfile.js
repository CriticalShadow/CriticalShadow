var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
 
gulp.task('minify-css', function() {
  gulp.src('client/css/*.css')
    .pipe(concat('app.css'))
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('client/css'));
});

// Concat & Minify JS
gulp.task('minify', function () {
  return gulp.src('client/js/*.js')
    .pipe(concat('vagabond.js'))
    .pipe(gulp.dest('client/js'))
    .pipe(rename('vagabond.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('client/js'));
});

// Lint Task
gulp.task('lint', function () {
  return gulp.src('/*/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('default', ['lint', 'minify-css']);