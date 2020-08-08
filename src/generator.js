const request = require("request-promise-native");
const {
  emptyDirs,
  mkdir,
  resolveApp,
  writeFileSync
} = require('./utils.js')

module.exports = class Generator {
  constructor(config) {
    this.config = config;
  }
  async fetchApi(projectConfig = this.config) {
    const {
      _yapi_token,
      _yapi_uid,
      projectId,
      serverUrl
    } = projectConfig;
    const url = `${serverUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false`;

    const headers = {
      Cookie: `_yapi_token=${_yapi_token};_yapi_uid=${_yapi_uid}`,
    };
    const res = await request.get(url, {
      json: true,
      headers: headers,
    });
    return res;
  }
  async generate() {
    const res = await this.fetchApi();
    const filesDesc = await Promise.all(
      res.map(async (catItem) => {
        const {
          list,
          ...rest
        } = catItem;
        const newList = await Promise.all(
          list.map(async (apiItem) => {
            return {
              ...apiItem,
            };
          })
        );
        return {
          ...rest,
          list: newList,
        };
      })
    );
    const arr = [];
    filesDesc.forEach((files) => {
      files.list.forEach((file) => {
        const {
          path,
          _id
        } = file;
        const name = this.generateApiName({
          path,
          _id,
        });
        const item = {
          id: file._id,
          catid: file.catid,
          path: file.path,
          name,
          method: file.method,
          title: file.title,
          markdown: file.markdown || "",
        };
        arr.push(item);
      });
    });
    return arr;
  }
  write(outputsBase, callback) {
    const outputs = outputsBase.filter((ele) => {
      if (this.config.catid && this.config.catid.exclude) {
        // 不期望的 catid 分类
        return this.config.catid.exclude.indexOf(String(ele.catid)) === -1;
      } else if (this.config.catid && this.config.catid.include) {
        // 只生成 catid 分类
        return this.config.catid.include.indexOf(String(ele.catid)) > -1;
      } else {
        return true;
      }
    });

    mkdir(this.config.outputFilePath, () => {
      emptyDirs(resolveApp(this.config.outputFilePath));
      outputs.forEach((api, i) => {
        const data = this.config.generateApiFileCode(api);
        writeFileSync(
          resolveApp(
            `${this.config.outputFilePath}/${api.name}.${this.config.target}`
          ),
          data
        );
        if (i === outputs.length - 1) {
          const AllApi = outputs.map((output) => output.name);
          const indexData = this.generateIndexCode(AllApi);
          mkdir(this.config.outputFilePath, () => {
            writeFileSync(
              resolveApp(
                `${this.config.outputFilePath}/index.${this.config.target}`
              ),
              indexData
            );
          });
          return callback && callback(true);
        }
      });
    });
  }
  generateApiName({
    path,
    _id
  }) {
    if (this.config.generateApiName) {
      return this.config.generateApiName(path, _id);
    } else {
      const reg = new RegExp("/", "g");
      let name = path.replace(reg, " ").trim();
      name = changeCase.pascalCase(name.trim());
      name += _id;
      return name;
    }
  }
  generateIndexCode(apis) {
    const arr = apis.map((api) => `import ${api} from './${api}'`);
    const importStr = arr.join(`
    `);
    const exportStr = `
export default {
  ${apis.join(`,
  `)}
}
    `;

    return `
${importStr}

${exportStr}
    `;
  }
}
