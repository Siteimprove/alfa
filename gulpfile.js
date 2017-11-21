const gulp = require('gulp')
const $ = require('gulp-load-plugins')()

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

gulp.task('build', () => gulp.src('packages/*/src/**/*.ts')
  .pipe($.babel(plugins.babel))
  .pipe($.rename(path => {
    path.dirname = path.dirname.replace('src', 'dist')
  }))
  .pipe(gulp.dest('packages'))
  .pipe($.size(plugins.size))
)
