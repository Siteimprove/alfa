const { dirname } = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const globby = require("globby");

function stat(path, options = { sync: false }) {
  if (options.sync) {
    return fs.statSync(path);
  }

  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

function read(path, options = { sync: false }) {
  if (options.sync) {
    return fs.readFileSync(path, "utf8");
  }

  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function write(path, data, options = { sync: false }) {
  if (options.sync) {
    return mkdirp.sync(path), fs.writeFileSync(path, data);
  }

  return new Promise((resolve, reject) => {
    mkdirp(dirname(path), err => {
      if (err) {
        reject(err);
      } else {
        fs.writeFile(path, data, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

function remove(path, options = { sync: false }) {
  if (options.sync) {
    return rimraf.sync(path);
  }

  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function glob(paths, options = { sync: false }) {
  if (options.sync) {
    return globby.sync(paths, { nodir: false });
  }

  return globby(paths, { nodir: false });
}

module.exports = { stat, read, write, remove, glob };
