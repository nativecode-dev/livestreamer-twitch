const gulp = require('gulp')
const os = require('os')
const plugins = require('gulp-load-plugins')()

const $ = plugins.configly(__dirname, 'package.json')

gulp.task('build', ['build:js', 'build:json'])

gulp.task('build:js', () => {
  return gulp.src($.sources.js)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.debug($.debug.js))
    .pipe(plugins.babel($.plugins.babel))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest($.destination.lib))
})

gulp.task('build:json', () => {
  return gulp.src($.sources.json)
    .pipe(plugins.debug($.debug.json))
    .pipe(gulp.dest($.destination.lib))
})

gulp.task('clean', () => {
  return gulp.src($.sources.clean)
    .pipe(plugins.debug())
    .pipe(plugins.clean())
})

gulp.task('compile', ['build'], () => {
  const exename = os.platform() === 'win32' ? 'livestreamer-watch.exe' : 'livestreamer-watch'
  const command = `nexe -i lib/index.js -o bin/${exename} -t .build`

  return plugins.run(command, $.plugins.nexe).exec()
    .pipe(gulp.dest('output'))
})

gulp.task('test', ['build'], () => {
  return gulp.src($.sources.tests)
    .pipe(plugins.mocha($.plugins.mocha))
})

gulp.task('default', ['build'])
