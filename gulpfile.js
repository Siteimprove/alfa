const gulp = require('gulp')
const size = require('gulp-size')
const newer = require('gulp-newer')
const babel = require('gulp-babel')
const glob = require('glob')
const { locale } = require('@endal/build')

const plugins = {
  size: {
    showFiles: true
  }
}

const packages = glob.sync('packages/*').map(package => package.replace('packages/', ''))

for (const package of packages) {
  const src = `packages/${package}/src`
  const dest = `packages/${package}/dist`

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

  gulp.task(`watch:${package}`, [`build:${package}`], () => {
    gulp.watch(`${src}/**/*.ts`, [`build:${package}`])
    gulp.watch(`${src}/**/*.hjson`, [`locale:${package}`])
  })
}
