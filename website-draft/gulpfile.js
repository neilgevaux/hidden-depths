// findme note: process automation file. Setup gulp listener
// from website root with: node_modules/gulp/bin/gulp.js
// and to watch use this node_modules/gulp/bin/gulp.js watch

var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var changed = require('gulp-changed');
var del = require('del');
//var imagemin = require('gulp-imagemin');// findme note: optional install to auto process images

// Gulp task to minify HTML files.
// Gathers all html files and minifies them into dist folder.
gulp.task('html', function () {
  return gulp.src(['./src/html/**/*.html'])
    .pipe(changed('dist/fonts'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('./dist'));
});

// Gulp task to process sass to css
// gathers all sass files and combines into single style file.
gulp.task('sass', function() {
  return gulp.src('./src/scss/*.scss')
    //findme note: can't use 'changed' as files are concatenated
    .pipe(concat('hidden-depths.min.css'))  // concatenate sass files into one css
    .pipe(sass())                           // parse sass
    .pipe(autoprefixer({                    // handle browser specific prefixes
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(csso())                           // minify css
    .pipe(gulp.dest('./dist/css/'))
});

// Gulp task to minify javascript
// gathers all javascript files and combines into one javascript file.
gulp.task('js', function () {
  return gulp.src('./src/js/*.js')
    // Gulp task to parse json through a linter
    // findme note: see this https://justinchmura.com/2016/06/28/eslint-using-gulp/
    // and this: https://github.com/standard/standard
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
// findme note: can't use 'changed' as files are concatenated see cache plugins
    .pipe(concat('hidden-depths.js'))   // concatenate sass files into one js file
//    .pipe(uglify())                         //minify js. findme to do: add .min to file name when activated
    .pipe(gulp.dest('./dist/js/'));
});

// Gulp task to direct copy any font files
gulp.task('jsprefab', function (){
  return gulp.src('src/jsprefab/**/*')
  .pipe(changed('dist/js'))
  .pipe(gulp.dest('dist/js'));
});


// Gulp task to direct copy any font files
gulp.task('fonts', function (){
  return gulp.src('src/fonts/**/*')
  .pipe(changed('dist/fonts'))
  .pipe(gulp.dest('dist/fonts'));
});

// Gulp task to direct copy any image files
gulp.task('images', function (){
  return gulp.src('src/images/**/*')
  .pipe(changed('dist/images'))
  .pipe(gulp.dest('dist/images'));
});

// Gulp task to direct copy any video files
gulp.task('videos', function (){
  return gulp.src('src/videos/**/*')
  .pipe(changed('dist/videos'))
  .pipe(gulp.dest('dist/videos'));
});



// findme ref: https://www.npmjs.com/package/gulp-4.0.build
// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
// But it must return either a Promise or Stream or take a Callback and call it
function clean() {
  del.sync(['dist/images/**', '!dist/images'])
  del.sync(['dist/videos/**', '!dist/videos'])
  del.sync(['dist/html/**', '!dist/html'])
  // remove all js files except the prefabs
  del.sync(['dist/js/**', '!dist/js','bootstrap.min.js','jquery.min.js','jquery.slim.min.js','popper.min.js'])
  del.sync(['dist/fonts/**', '!dist/fonts'])
  // remove all css files except the prefabs
  del.sync(['dist/css/**', '!dist/css', '!bootstrap-grid.min.css', '!bootstrap-reboot.min.css', '!bootstrap.min.css'])

  // You can use multiple globbing patterns as you would with `gulp.src`
  // If you are using del 2.0 or above, return its promise
  return del(['build']);
}



// findme note: defining something as a task exposes it to the cli but isn't used by watch(.?)
// findme note: defining as task has impact on call order
// can also use 'export.thing' method see https://github.com/gulpjs/gulp/tree/4.0#sample-gulpfilejs

gulp.task(clean);   // clean output directory
gulp.task(watch);   // register gulp watch task

// perform all straight copy tasks in parallel
gulp.task('copy', gulp.parallel(
  'fonts',
  'videos',
  'images',
  'jsprefab'
));


// full build when run from terminal - performs a clean to remove deleted files
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'html',
    'sass',
    'js',
    'copy'
  )
));



// The default task (called when you run `gulp` from cli)
// findme note: the defualt task is different in gulp 4 than 3. Be careful what you look at online.
gulp.task('default', gulp.series('clean','build'));




// Watches each production folder for changes and acts
//findme note: doesn't clean output directories
// findme ref: https://www.npmjs.com/package/gulp-4.0.build
// findme note: gulp 4 doesn't like functions or tasks, but be serialised
// findme ref: https://stackoverflow.com/questions/39665773/gulp-error-watch-task-has-to-be-a-function#39665899
function watch() {
  gulp.watch('src/js/*.js',gulp.series('js'));
  gulp.watch('src/html/*.html',gulp.series('html'));
  gulp.watch('src/scss/*.scss',gulp.series('sass'));
  gulp.watch('src/jsprefab/*.js', gulp.series('jsprefab'));
  gulp.watch('src/images/*', gulp.series('images'));
  gulp.watch('src/fonts/*', gulp.series('fonts'));
  gulp.watch('src/videos/*', gulp.series('videos'));
}
