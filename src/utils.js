const fs = require('fs');
const path = require('path');

export const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (relativePath) =>
  path.resolve(appDirectory, relativePath);
export const mkdir = (dirpath, callback) => {
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

export const emptyDirs = (dirpath) => {
  let chunkList = fs.readdirSync(dirpath);
  chunkList.forEach((file) => {
    fs.unlinkSync(dirpath + "/" + file);
  });
};

export const writeFileSync = (dirpath, data) => {
  fs.writeFileSync(dirpath, data);
  consola.success(`文件写入成功: ${dirpath}`);
};

