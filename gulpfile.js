const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const glob = require('glob')
const { locale } = require('@endal/build')

const browsers = [
  'chrome >= 55',
  'edge >= 15',
  'firefox >= 55',
  'opera >= 48',
  'safari >= 10.1'
]

const plugins = {
  babel: {
    presets: [
      ['@babel/env', { targets: { browsers } }],
      ['@babel/stage-2'],
      ['@babel/typescript']
    ],
    plugins: [
      ['@babel/transform-react-jsx', { pragma: 'jsx' }]
    ]
  },

  size: {
    showFiles: true
  }
}

const packages = glob.sync('packages/*').map(package => package.replace('packages/', ''))

for (const package of packages) {
  const src = `packages/${package}/src`
  const dest = `packages/${package}/dist`

  gulp.task(`build:${package}`, () => gulp.src(`${src}/**/*.ts`)
    .pipe($.newer({ dest, ext: '.js' }))
    .pipe($.babel(plugins.babel))
    .pipe(gulp.dest(dest))
    .pipe($.size({ ...plugins.size, title: package }))
  )

  gulp.task(`locale:${package}`, () => gulp.src(`${src}/**/locale/*.hjson`)
    .pipe($.newer({ dest: src, ext: '.ts' }))
    .pipe(locale())
    .pipe(gulp.dest(src))
    .pipe($.size({ ...plugins.size, title: package }))
  )

  gulp.task(`watch:${package}`, [`build:${package}`], () => {
    gulp.watch(`${src}/**/*.ts`, [`build:${package}`])
    gulp.watch(`${src}/**/*.hjson`, [`locale:${package}`])
  })
}
