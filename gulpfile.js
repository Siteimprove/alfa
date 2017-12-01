const path = require('path')
const gulp = require('gulp')
const size = require('gulp-size')
const newer = require('gulp-newer')
const babel = require('gulp-babel')
const ava = require('gulp-ava')
const sourcemaps = require('gulp-sourcemaps')
const ignore = require('gulp-ignore')
const sequence = require('gulp-sequence')
const del = require('del')
const glob = require('glob')
const { locale } = require('@alfa/build')

const plugins = {
  ava: {
    nyc: true,
    verbose: true,
    require: [
      '@alfa/jsx/register'
    ]
  },

  size: {
    showFiles: true
  }
}

const packages = glob.sync('packages/*').map(package => package.replace('packages/', ''))

for (const package of packages) {
  const base = `packages/${package}`
  const src = `${base}/src`
  const dest = `${base}/dist`
  const test = `${base}/test`
  const tmp = `${base}/.tmp`

  gulp.task(`build:${package}`, () => gulp.src(`${src}/**/*.ts`)
    .pipe(newer({ dest, ext: '.js' }))
    .pipe(babel({ presets: ['@alfa/build/babel'] }))
    .pipe(gulp.dest(dest))
    .pipe(size({ ...plugins.size, title: package }))
  )

  gulp.task(`locale:${package}`, () => gulp.src(`${src}/**/locale/*.hjson`)
    .pipe(newer({ dest: src, ext: '.ts' }))
    .pipe(locale())
    .pipe(gulp.dest(src))
    .pipe(size({ ...plugins.size, title: package }))
  )

  gulp.task(`test:${package}`, () => gulp.src([`${src}/**/*.ts`, `${test}/**/*.ts{,x}`], { base })
    .pipe(sourcemaps.init())
    .pipe(babel(({ presets: ['@alfa/build/babel'] })))
    .pipe(sourcemaps.write('.', {
      sourceRoot: path.join(__dirname, base, '/')
    }))
    .pipe(gulp.dest(tmp))
    .pipe(ignore.include('*.spec.js'))
    .pipe(ava(plugins.ava))
  )

  gulp.task(`clean:${package}`, () => del([dest, tmp]))

  gulp.task(`watch:${package}`, [`build:${package}`], () => {
    gulp.watch(`${src}/**/*.ts`, [`build:${package}`])
    gulp.watch(`${base}/**/*.ts{,x}`, [`test:${package}`])
    gulp.watch(`${src}/**/*.hjson`, [`locale:${package}`])
  })
}

for (const task of ['build', 'watch', 'test', 'clean']) {
  gulp.task(task, sequence(...packages.map(package => `${task}:${package}`)))
}
