"use strict";

const path = require("path");
const lodash = require("lodash");
const out = require("./lib/out");

const cwd = process.cwd();
const token = process.env.YUQUE_TOKEN;
const defaultConfig = {
  postPath: "source/_posts/yuque",
  imageLocalPath: "source/images",
  saveImage: undefined, // cos, local, undefined
  cos: undefined,
  cachePath: "yuque.json",
  mdNameFormat: "title",
  baseUrl: "https://www.yuque.com/api/v2/",
  token,
  login: "",
  repo: "",
  adapter: "hexo",
  concurrency: 5,
  onlyPublished: false,
  onlyPublic: false,
};

function loadConfig() {
  const pkg = loadConfigFile();
  if (!pkg) {
    out.error("current directory should have a package.json");
    return null;
  }
  if (!lodash.isObject(pkg)) {
    out.error("package.yueConfig should be an object.");
    return null;
  }
  const config = Object.assign({}, defaultConfig, pkg);
  return config;
}

function loadConfigFile() {
  const pkgPath = path.join(cwd, "quexo.config.js");
  try {
    const pkg = require(pkgPath);
    return pkg;
  } catch (error) {
    // do nothing
  }
}

module.exports = loadConfig();
