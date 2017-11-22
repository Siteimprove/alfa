const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const glob = require('glob')

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
  const src = `packages/${package}/src/**/*.ts`
  const dest = `packages/${package}/dist`

  gulp.task(`build:${package}`, () => gulp.src(src)
    .pipe($.newer({ dest, ext: '.js' }))
    .pipe($.babel(plugins.babel))
    .pipe(gulp.dest(dest))
    .pipe($.size({ ...plugins.size, title: package }))
  )

  gulp.task(`watch:${package}`, [`build:${package}`], () => {
    gulp.watch(src, [`build:${package}`])
  })
}
