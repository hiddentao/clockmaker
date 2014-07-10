var gulp = require('gulp'),
  path = require('path');

var stylus = require('gulp-stylus');
var nib = require('nib');
var minifyCSS = require('gulp-minify-css');
var expect = require('gulp-expect-file');
var runSequence = require('run-sequence');


var paths = {
  stylusSrcFiles: './stylus/styles.styl',
  stylusSrcFilesWatch: './stylus/**.styl',
  cssBuildFolder: './css',
};


gulp.task('css', function () {
  return gulp.src( paths.stylusSrcFiles )
    .pipe( stylus({
      use: [ nib() ],
      errors: true
    }) )
    .pipe( minifyCSS({
      keepSpecialComments: 0,
      noAdvanced: true
    }) )
    .pipe( gulp.dest( paths.cssBuildFolder ) )
    ;
});


gulp.task('watch', ['css'], function() {
  gulp.watch(paths.stylusSrcFilesWatch, ['css']); 
});


gulp.task('build', ['css']);


gulp.task('verify-build', function() {
  return gulp.src(
      [].concat(
        path.join(paths.cssBuildFolder, '**', '*.*')
      )
    )
    .pipe( expect([
      'css/styles.css'
    ]) )
  ;
})


gulp.task('default', function(cb) {
  runSequence(
    'build', 
    'verify-build',
    cb
  );
});

