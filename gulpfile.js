const path = require('path')
const gulp = require('gulp')
const size = require('gulp-size')
const newer = require('gulp-newer')
const babel = require('gulp-babel')
const ava = require('gulp-ava')
const sourcemaps = require('gulp-sourcemaps')
const when = require('gulp-if')
const glob = require('glob')
const { locale } = require('@endal/build')

const plugins = {
  ava: {
    verbose: true,
    require: [
      '@endal/jsx/register'
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

  gulp.task(`build:${package}`, () => gulp.src(`${src}/**/*.ts`)
    .pipe(newer({ dest, ext: '.js' }))
    .pipe(babel({ presets: ['@endal/build/babel'] }))
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
    .pipe(babel(({ presets: ['@endal/build/babel'] })))
    .pipe(sourcemaps.write('.', {
      sourceRoot: path.join(__dirname, base, '/')
    }))
    .pipe(gulp.dest(`${base}/.tmp`))
    .pipe(when('*.spec.js', ava(plugins.ava)))
  )

  gulp.task(`watch:${package}`, [`build:${package}`], () => {
    gulp.watch(`${src}/**/*.ts`, [`build:${package}`])
    gulp.watch(`${src}/**/*.hjson`, [`locale:${package}`])
  })
}

gulp.task('build', packages.map(package => `build:${package}`))
gulp.task('watch', packages.map(package => `watch:${package}`))
gulp.task('test', packages.map(package => `test:${package}`))
