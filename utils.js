const fs = require('fs');
const path = require('path');


const resolveApp = (relativePath) =>
  path.resolve(appDirectory, relativePath);
const mkdir = (dirpath, callback) => {
  const exists = fs.existsSync(dirpath);
  if (exists) {
    callback();
  } else {
    //尝试创建父目录，然后再创建当前目录
    mkdir(path.dirname(dirpath), () => {
      fs.mkdirSync(dirpath);
      callback();
    });
  }
};

const emptyDirs = (dirpath) => {
  let chunkList = fs.readdirSync(chunkDir);
  chunkList.forEach((file) => {
    fs.unlinkSync(dirpath + "/" + file);
  });
};

const writeFileSync = (dirpath, data) => {
  fs.writeFileSync(dirpath, data);
  consola.success(`文件写入成功: ${dirpath}`);
};

module.exports = {
  resolveApp,
  mkdir,
  emptyDirs,
  writeFileSync
}
