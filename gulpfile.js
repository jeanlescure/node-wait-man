var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var reactify = require('reactify');
var runSequence = require('run-sequence');
var bump = require('gulp-bump');
var git = require('gulp-git');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));


gulp.task('javascript', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './lib/wait-man.js',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: [reactify]
  });

  return b.bundle()
    .pipe(source('wait-man.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('bump-version', function () {
//Note: I have hardcoded the version change type to 'patch' but it may be a good idea to use 
//      minimist (https://www.npmjs.com/package/minimist) to determine with a command argument whether you are doing 
//      a 'major', 'minor' or a 'patch' change.
  var version_type = 'minor';
  if (typeof argv.patch !== 'undefined') version_type = 'patch';
  if (typeof argv.minor !== 'undefined') version_type = 'minor';
  if (typeof argv.major !== 'undefined') version_type = 'major';
  
  return gulp.src('./package.json')
    .pipe(bump({type: version_type}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('add-changes', function () {
  return gulp.src('.')
    .pipe(git.add());
});

gulp.task('commit-changes', function () {
  return gulp.src('.')
    .pipe(git.commit('New release ready.'));
});

gulp.task('push-changes', function (cb) {
  git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', function (cb) {
  var version = getPackageJsonVersion();
  git.tag(version, 'Created Tag for version: ' + version, function (error) {
    if (error) {
      return cb(error);
    }
    git.push('origin', 'master', {args: '--tags'}, cb);
  });

  function getPackageJsonVersion () {
    //We parse the json file instead of using require because require caches multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  };
});

gulp.task('release', function (callback) {
  runSequence(
    'javascript',
    'bump-version',
    'add-changes',
    'commit-changes',
    'push-changes',
    'create-new-tag',
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('RELEASE FINISHED SUCCESSFULLY');
      }
      callback(error);
    });
});