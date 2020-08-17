'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const config = require('../config');
const out = require('./out');

const cwd = process.cwd();

module.exports = {
  // clear directory of generated posts
  cleanPosts() {
    const { postPath, imagePath } = config;
    const postDist = path.join(cwd, postPath);
    out.info(`remove yuque posts: ${postDist}`);
    rimraf.sync(postDist);
    if (imagePath) {
      const imageDist = path.join(cwd, imagePath);
      out.info(`remove yuque posts: ${imageDist}`);
      rimraf.sync(imageDist);
    }
  },

  // clear cache of posts' data
  clearCache() {
    const cachePath = path.join(cwd, 'yuque.json');
    try {
      out.info(`remove yuque local cache: ${cachePath}`);
      fs.unlinkSync(cachePath);
    } catch (error) {
      out.warn(error.message);
    }
  },
};
