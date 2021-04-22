import del from 'del'
import fs from 'fs'
import glob from 'fast-glob'
import gulp from 'gulp'
import gulpMocha from 'gulp-mocha'
import gulpSass from 'gulp-sass'
import gulpStandard from 'gulp-standard'
import gulpZip from 'gulp-zip'
import gulpLog from 'gulplog'
import { rollup } from 'rollup'
import strip from '@rollup/plugin-strip'
import modify from 'rollup-plugin-modify'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import sass from 'sass'
import ws from 'ws'

gulpSass.compiler = sass

const paths = {
  fonts: {
    src: 'app/fonts/**/*',
    dest: 'dist/fonts'
  },
  html: {
    src: 'app/**/*.html',
    dest: 'dist'
  },
  images: {
    src: 'app/images/**/*',
    dest: 'dist/images'
  },
  lint: {
    src: ['gulpfile.js', 'app/**/*.js', 'test/**/*.js']
  },
  locales: {
    src: 'app/_locales/**/*',
    dest: 'dist/_locales'
  },
  manifest: {
    src: 'app/manifest.json',
    dest: 'dist'
  },
  scripts: {
    src: 'app/scripts/**/*',
    dest: 'dist/scripts',
    ignore: '**/lib'
  },
  styles: {
    src: 'app/styles/**/*',
    dest: 'dist/styles'
  },
  test: {
    src: 'test/**/*test.js'
  },
  zip: {
    src: 'dist/**/*',
    dest: 'package'
  }
}

function clean () {
  return del(['dist/*'], { dot: true })
}

function manifest () {
  return gulp.src(paths.manifest.src)
    .pipe(gulp.dest(paths.manifest.dest))
}

function locales () {
  return gulp.src(paths.locales.src)
    .pipe(gulp.dest(paths.locales.dest))
}

function html () {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
}

function images () {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest))
}

function fonts () {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
}

function zip () {
  const manifest = JSON.parse(fs.readFileSync(paths.manifest.src, 'utf8'))
  return gulp.src(paths.zip.src)
    .pipe(gulpZip('tab-application-switcher-' + manifest.version + '.zip'))
    .pipe(gulp.dest(paths.zip.dest))
}

async function _scripts (opts = {}) {
  const files = glob.sync(paths.scripts.src, { ignore: paths.scripts.ignore, dot: true })
  files.map(async (file) => {
    const bundle = await rollup({
      input: file,
      plugins: [
        opts.package && (
          modify({
            find: RegExp('.*// dev'),
            replace: ''
          })
        ),
        opts.package && strip(),
        nodePolyfills(),
        nodeResolve(),
        commonjs(),
        opts.package && terser()
      ]
    })

    await bundle.write({
      file: `${paths.scripts.dest}/${file.split('/').pop()}`,
      format: 'umd'
    })
  })
}

function scripts () {
  return _scripts()
}

function scriptsPackage () {
  return _scripts({ package: true })
}

function styles () {
  return gulp.src(paths.styles.src)
    .pipe(gulpSass.sync().on('error', gulpSass.logError))
    .pipe(gulp.dest(paths.styles.dest))
}

function _lint (opts = {}) {
  const fix = opts.fix ?? false
  const changed = opts.changed ?? false

  const src = paths.lint.src
  return gulp.src(src, { base: './', since: changed ? gulp.lastRun(src) : undefined })
    .pipe(gulpStandard({ fix: fix }))
    .pipe(gulpStandard.reporter('default', {
      quiet: true,
      showRuleNames: true
    }))
    .pipe(fix ? gulp.dest('.') : gulp.src('.', { allowEmpty: true }))
}

function lint () {
  return _lint()
}

function lintChanged () {
  return lint({ changed: true })
}

function lintFix () {
  return _lint({ fix: true })
}

function _test (opts = {}) {
  const changed = opts.changed ?? false

  const src = paths.test.src
  return gulp.src(src, { read: false, since: changed ? gulp.lastRun(src) : undefined })
    .pipe(gulpMocha())
    .on('error', gulpLog.error)
}

function test () {
  return _test()
}

function testChanged () {
  return _test({ changed: true })
}

function dev () {
  let reloader
  const server = new ws.Server({ port: 5454 })
  server.on('connection', (ws) => {
    reloader = ws
  })
  server.on('message', (message) => {
    gulpLog(message)
  })

  async function reload () {
    if (reloader) {
      reloader.send('reload-extension')
    }
  }

  gulp.watch(paths.fonts.src, gulp.series(fonts, reload))
  gulp.watch(paths.html.src, gulp.series(html, reload))
  gulp.watch(paths.images.src, gulp.series(images, reload))
  gulp.watch(paths.locales.src, gulp.series(locales, reload))
  gulp.watch(paths.manifest.src, gulp.series(manifest, reload))
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload))
  gulp.watch(paths.styles.src, gulp.series(styles, reload))

  gulp.watch(paths.scripts.src, gulp.series(lintChanged, test))
  gulp.watch(paths.test.src, gulp.series(lintChanged, testChanged))
}

const build = gulp.series(
  fonts,
  html,
  images,
  locales,
  manifest,
  scripts,
  styles
)

const pack = gulp.series(
  clean,
  lintFix,
  test,
  fonts,
  html,
  images,
  locales,
  manifest,
  scriptsPackage,
  styles,
  zip
)

export default gulp.series(
  clean,
  build,
  dev
)

export {
  build,
  clean,
  dev,
  fonts,
  html,
  images,
  lint,
  lintChanged,
  lintFix,
  locales,
  manifest,
  pack,
  scripts,
  scriptsPackage,
  styles,
  test,
  testChanged,
  zip
}
