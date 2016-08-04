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

const $ = gulpLoadPlugins();

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
    return browserify('app/scripts/' + file, { debug: true })
      .transform(hbsfy)
      .transform('babelify', { presets: ['es2015'] })
      .bundle().on('error', $.util.log)
      .pipe(source(file))
      .pipe(gulp.dest('dist/scripts'));
  });
  return eventStream.merge.apply(null, tasks);
});

gulp.task('styles', () => {
  return gulp.src('app/styles/!(lib)')
    .pipe($.sourcemaps.init())
    .pipe($.sass({ includePaths: 'node_modules' }).on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('test', () => {
  return gulp.src('test/**/*test.js', { read: false })
    .pipe($.mocha());
});

gulp.task('watch', () => {
  let server = new ws.Server({ port: 5454 });

  let connection;
  server.on('connection', (ws) => {
    connection = ws;
  });

  function reload() {
    $.util.log('-- reload');
    if (connection) {
      connection.send('reload-extension', $.util.log);
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
