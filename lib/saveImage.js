const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const out = require("./out");
const { saveImageToCOS } = require("./cos");

const { imageLocalPath, saveImage, cos = {} } = config;
const cwd = process.cwd();
const imageDist = path.join(cwd, imageLocalPath || "");
if (saveImage) mkdirsSync(imageDist);

module.exports = function (body) {
  if (!saveImage) return body;
  try {
    const reg = /\!\[[\s\S]*?\]\([\s\S]*?\)/g;
    return body.replace(reg, (match) => {
      return match.replace(/\((.*)\)/, (match1, url) => {
        const imgName = getImagName(url);
        saveImgFile(url.replace("https:", "http:"), imgName);
        return `(${getImagePath(imageLocalPath, imgName)})`;
      });
    });
  } catch (error) {
    console.log("error", error);
    return body;
  }
};

function saveImgFile(src, imgName) {
  console.log("src", src);
  http.get(src, (res) => {
    let imgData = "";
    res.setEncoding("binary");
    res.on("data", function (chunk) {
      imgData += chunk;
    });
    res.on("end", function () {
      if (imgData) {
        if (saveImage === "local") {
          const filePath = path.join(imageDist, imgName);
          saveToLocal(filePath, imgData);
        }
        if (saveImage === "cos") {
          saveImageToCOS(imgName, imgData);
        }
      } else {
        console.error(src + " 下载失败！,图片路径不存在！");
      }
    });
  });
}

function saveToLocal(filePath, imgData) {
  fs.writeFile(filePath, imgData, "binary", function (err) {
    if (err) {
      out.error(imgName + " down fail", err);
    }
    console.info(imgName + " down success");
  });
}

function getImagName(url = "") {
  const imgReg = /.*\.(png|jpe?g|webp|gif)$/;
  const names = url.split(/\/|\?|\#/);
  for (const item of names) {
    if (imgReg.test(item)) {
      return item;
    }
  }
}
function getImagePath(src, imgName) {
  if (saveImage === "local") {
    const paths = src.split("source/");
    const imgPath = paths[paths.length - 1];
    return "/" + path.join(imgPath, imgName);
  }
  if (saveImage === "cos") {
    const { url, prefix } = cos;
    return path.join(url, prefix, imgName);
  }
}

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
