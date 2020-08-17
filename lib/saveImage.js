const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const out = require('./out');

const { imagePath } = config
const cwd = process.cwd();
const imageDist = path.join(cwd, imagePath||'');
if(imagePath) fs.mkdirSync(imageDist)

module.exports = function (body) {
  if(!imagePath) return body
  try {
    const reg = /\!\[[\s\S]*?\]\([\s\S]*?\)/g;
    return body.replace(reg, (match) => {
      return match.replace(/\((.*)\)/, (match1, url) => {
        const imgNage = getImagName(url);
        saveImgFile(url.replace('https:', 'http:'), imgNage);
        return `(${getImagePath(imagePath)}${imgNage})`;
      });
    });
  } catch (error) {
    console.log('error', error)
    return body
  }
};

function saveImgFile(src, imgName) {
  console.log('src', src)
  http.get(src, (res) => {
    let imgData = '';
    res.setEncoding('binary');
    res.on('data', function (chunk) {
      imgData += chunk;
    });
    res.on('end', function () {
      if (imgData) {
        const filePath = path.join(imageDist, imgName);
        fs.writeFile(filePath, imgData, 'binary', function (err) {
          if (err) {
            out.error(imgName + ' down fail', err);
          }
          console.info(imgName + ' down success');
        });
      } else {
        console.error(src + ' 下载失败！,图片路径不存在！');
      }
    });
  });
}

function getImagName(url = '') {
  const imgReg = /.*\.(png|jpe?g|webp|gif)$/;
  const names = url.split(/\/|\?|\#/);
  for (const item of names) {
    if (imgReg.test(item)) {
      return item;
    }
  }
}
function getImagePath(path) {
  const paths = path.split('source/')
  const imgPath = paths[paths.length - 1]
  return imgPath.endsWith('/') ? imgPath : imgPath + '/'
}