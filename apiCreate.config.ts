const config = {
  target: "js",
  serverUrl: "http://yapi.ywfe.com",
  outputFilePath: "src/yapi",
  projectId: "13",
  _yapi_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjI5MCwiaWF0IjoxNTg4NzI5NDIyLCJleHAiOjE1ODkzMzQyMjJ9.2YW270HO-S6db_5Pf1QLlh06wps7Ym2itU1G9TA0Qw4",
  _yapi_uid: "290",
  generateApiName: (path, id) => {
    return `id${id}`;
  },
  generateApiFileCode: (api) => {
    const method = api.method.toLocaleLowerCase();
    const arr = [
      `
      /**
      * ${api.title}
      * ${api.markdown || ""}
      * ${api.path}
      **/
      `,
      "import request from '@/js/ajax.js'",

      `
      export default (data = {}, flag = true) => request.${method}('${
        api.path
      }', data${method === "post" ? ", flag" : ""})
      `,
    ];
    return arr.join(`
    `);
  },
};

export default config;
