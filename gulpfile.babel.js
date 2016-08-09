'use strict';

import gulp from 'gulp';
import glob from 'glob';
import del from 'del';
import ws from 'ws';
import browserify from 'browserify';
import hbsfy from 'hbsfy';
import source from 'vinyl-source-stream';
import eventStream from 'event-stream';
import runSequence from 'run-sequence';
import gulpLoadPlugins from 'gulp-load-plugins';
import through from 'through2';

const $ = gulpLoadPlugins();

let errorHandler = $.notify.onError({
  title: 'Gulp Error',
  message: 'Error: <%= error.message %>',
  sound: 'Bottle'
});

let originalGulpSrc = gulp.src;
gulp.src = function() {
  return originalGulpSrc.apply(gulp, arguments)
    .pipe($.plumber({ errorHandler: errorHandler }));
};

gulp.task('clean', () => {
  return del(['dist/*'], { dot: true });
});

gulp.task('manifest', () => {
  return gulp.src('app/manifest.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('locales', () => {
  return gulp.src('app/_locales/**/*')
    .pipe(gulp.dest('dist/_locales'));
});

gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('fonts', () => {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('lint', () => {
  return gulp.src(['app/scripts/**/*.js', 'test/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('format', ['lint'], () => {
  return gulp.src(['app/scripts/**/*.js', 'test/**/*.js'], { base: '.' })
    .pipe($.eslint({ fix: true }))
    .pipe($.eslint.format())
    .pipe(gulp.dest('.'));
});

gulp.task('scripts', () => {
  let files = glob.sync('!(lib)', { cwd: 'app/scripts' });
  let tasks = files.map((file) => {
    return browserify('app/scripts/' + file, { debug: $.util.env.type !== 'prod' })
      .transform(() => {
        if ($.util.env.type === 'prod') {
          return through(function(buf, enc, next) {
            this.push(buf.toString('utf8').replace(/^.*\/\/\s*dev$/gm, '')); // remove all lines that end in '// dev'
            next();
          });
        } else {
          return $.util.noop();
        }
      })
      .transform(hbsfy)
      .transform('babelify', { presets: ['es2015'] })
      .bundle().on('error', errorHandler)
      .pipe(source(file))
      .pipe(gulp.dest('dist/scripts'));
  });
  return eventStream.merge.apply(null, tasks);
});

gulp.task('styles', () => {
  return gulp.src('app/styles/!(lib)')
    .pipe($.sourcemaps.init())
    .pipe($.sass({ includePaths: 'node_modules' }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('test', () => {
  return gulp.src('test/**/*test.js', { read: false })
    .pipe($.mocha());
});

gulp.task('package', ['clean', 'lint', 'test'], (cb) => {
  $.util.env.type = 'prod';
  runSequence('build', 'zip', cb);
});

gulp.task('zip', () => {
  let manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
    .pipe($.zip('tab-application-switcher-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('watch', () => {
  let server = new ws.Server({ port: 5454 });

  let reloader;
  server.on('connection', (ws) => {
    reloader = ws;
  });

  function reload() {
    $.util.log('-- reload');
    if (reloader) {
      reloader.send('reload-extension', $.util.log);
    }
  }

  gulp.watch('app/manifest.json', () => { runSequence('manifest', reload); });
  gulp.watch('app/_locales/**/*', () => { runSequence('locales', reload); });
  gulp.watch('app/**/*.html', () => { runSequence('html', reload); });
  gulp.watch('app/images/**/*', () => { runSequence('images', reload); });
  gulp.watch(['app/scripts/**/*', 'app/templates/**/*'], () => { runSequence('scripts', reload); });
  gulp.watch('app/styles/**/*', () => { runSequence('styles', reload); });
});

gulp.task('dev', ['build'], (cb) => {
  runSequence(['test', 'watch'], cb);
  gulp.watch('app/scripts/**/*', ['lint', 'test']);
  gulp.watch('test/**/*test.js', (file) => {
    gulp.src(file.path)
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.mocha());
  });
});

gulp.task('build', ['manifest', 'locales', 'html', 'images', 'fonts', 'scripts', 'styles']);

gulp.task('default', ['build']);
