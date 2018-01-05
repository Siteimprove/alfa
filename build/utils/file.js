const { dirname } = require('path')
const { readFile, writeFile } = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const globby = require('globby')

function read (path) {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function write (path, data) {
  return new Promise((resolve, reject) => {
    mkdirp(dirname(path), err => {
      if (err) {
        reject(err)
      } else {
        writeFile(path, data, err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
  })
}

function remove (path) {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function glob (paths) {
  return globby(paths)
}

module.exports = { read, write, remove, glob }
