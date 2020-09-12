const COS = require('cos-nodejs-sdk-v5');
const path = require('path');
const config = require('../config');
const { region = 'ap-shanghai', bucket, prefix = '' } = config.cos || {};
const cos = new COS({
  SecretId: process.env.COS_SECRETID,
  SecretKey: process.env.COS_SECRETKEY,
});

let backup = null;

const getAllFilename = () => {
  return new Promise((resolve, reject) => {
    if (Array.isArray(backup)) return resolve(backup);
    cos.getBucket(
      {
        Bucket: bucket /* 必须 */,
        Region: region /* 必须 */,
        Prefix: prefix /* 非必须 */,
      },
      function (err, data) {
        console.log(err || data.Contents);
        if (Array.isArray(data.Contents)) {
          backup = data.Contents.map((v) => v.Key.replace(prefix, ''));
        }
        resolve(backup);
      },
    );
  });
};

exports.saveImageToCOS = async (imgName, imgData) => {
  try {
    const imageList = await getAllFilename();
    if (imageList.includes(imgName)) return;
    cos.putObject(
      {
        Bucket: bucket /* 必须 */,
        Region: region /* 必须 */,
        Key: path.join(prefix, imgName) /* 必须 */,
        Body: Buffer.from(imgData, 'binary'), // 上传文件对象
        onProgress: function (progressData) {
          console.log(JSON.stringify(progressData));
        },
      },
      function (err, data) {
        console.log(err || data);
      },
    );
  } catch (error) {}
};
