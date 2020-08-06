const config = {
  target: "js",
  serverUrl: "http://yapi.ywfe.com",
  outputFilePath: "api",
  projectId: "85",
  _yapi_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjI5MCwiaWF0IjoxNTk2MTEwNDQzLCJleHAiOjE1OTY3MTUyNDN9.J2LGFRr9vVj6pD43LkY0lNTQb6Bxk3Cz2H1m2zLrljE;",
  _yapi_uid: "290",
  generateApiName: (path, id) => {
    return `id${id}`;
  },
  generateApiFileCode: (api) => {
    const method = api.method.toLocaleLowerCase();
    const isParamsUrl = api.path.indexOf("{") > -1;
    const arr = [
      `
      /**
      * ${api.title}
      * ${api.markdown || ""}
      * ${api.path}
      **/
      `,
      "import request from './../request'",
    ];
    if (isParamsUrl) {
      // 带params 格式参数
      const reg = /\{.*?\}/g;
      const paramsKeys = api.path
        .match(reg)
        .map((ele) => ele.replace("{", "").replace("}", ""));
      const paramsKeysStr = paramsKeys.reduce((prev, value) => {
        prev += `${value}, `;
        return prev;
      }, "");
      arr.push(
        `export default (${paramsKeysStr} data={}) => request({
           method: '${api.method}',
           url: '${api.path.replace(/\{/, `'+`).replace(/\}/, "")},
          ${(() => {
            if (api.method.toLocaleLowerCase() === "get") {
              return "params: data";
            }
            return "data: data";
          })()}
        })`
      );
    } else {
      arr.push(
        `const http = (data={}) =>  request({
          method: '${method}',
          url: '${api.path}',
          ${(() => {
            if (api.method.toLocaleLowerCase() === "get") {
              return "params: data";
            }
            return "data: data";
          })()}
        }) `,
        `export default http`
      );
    }
    return arr.join(`
  `);
  },
};

module.exports = config;
