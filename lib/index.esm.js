#!/usr/bin/env node
import path from 'path';

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

var request = require("request-promise-native");

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

var _require = require('./utils.js'),
    emptyDirs = _require.emptyDirs,
    mkdir = _require.mkdir,
    resolveApp = _require.resolveApp,
    writeFileSync = _require.writeFileSync;

module.exports = /*#__PURE__*/function () {
  function Generator(config) {
    _classCallCheck(this, Generator);

    this.config = config;
  }

  _createClass(Generator, [{
    key: "fetchApi",
    value: function fetchApi(projectConfig) {
      try {
        var _this2 = this;

        if (projectConfig === undefined) projectConfig = _this2.config;
        var _projectConfig = projectConfig,
            _yapi_token = _projectConfig._yapi_token,
            _yapi_uid = _projectConfig._yapi_uid,
            projectId = _projectConfig.projectId,
            serverUrl = _projectConfig.serverUrl;
        var url = "".concat(serverUrl, "/api/plugin/export?type=json&pid=").concat(projectId, "&status=all&isWiki=false");
        var headers = {
          Cookie: "_yapi_token=".concat(_yapi_token, ";_yapi_uid=").concat(_yapi_uid)
        };
        return _await(request.get(url, {
          json: true,
          headers: headers
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "generate",
    value: function generate() {
      try {
        var _this4 = this;

        return _await(_this4.fetchApi(), function (res) {
          return _await(Promise.all(res.map(_async(function (catItem) {
            var list = catItem.list,
                rest = _objectWithoutProperties(catItem, ["list"]);

            return _await(Promise.all(list.map(function (apiItem) {
              return _await(Object.assign({}, apiItem));
            })), function (newList) {
              return Object.assign({}, rest, {
                list: newList
              });
            });
          }))), function (filesDesc) {
            var arr = [];
            filesDesc.forEach(function (files) {
              files.list.forEach(function (file) {
                var path = file.path,
                    _id = file._id;

                var name = _this4.generateApiName({
                  path: path,
                  _id: _id
                });

                var item = {
                  id: file._id,
                  catid: file.catid,
                  path: file.path,
                  name: name,
                  method: file.method,
                  title: file.title,
                  markdown: file.markdown || ""
                };
                arr.push(item);
              });
            });
            return arr;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "write",
    value: function write(outputsBase, callback) {
      var _this5 = this;

      var outputs = outputsBase.filter(function (ele) {
        if (_this5.config.catid && _this5.config.catid.exclude) {
          // 不期望的 catid 分类
          return _this5.config.catid.exclude.indexOf(String(ele.catid)) === -1;
        } else if (_this5.config.catid && _this5.config.catid.include) {
          // 只生成 catid 分类
          return _this5.config.catid.include.indexOf(String(ele.catid)) > -1;
        } else {
          return true;
        }
      });
      mkdir(this.config.outputFilePath, function () {
        emptyDirs(resolveApp(_this5.config.outputFilePath));
        outputs.forEach(function (api, i) {
          var data = _this5.config.generateApiFileCode(api);

          writeFileSync(resolveApp("".concat(_this5.config.outputFilePath, "/").concat(api.name, ".").concat(_this5.config.target)), data);

          if (i === outputs.length - 1) {
            var AllApi = outputs.map(function (output) {
              return output.name;
            });

            var indexData = _this5.generateIndexCode(AllApi);

            mkdir(_this5.config.outputFilePath, function () {
              writeFileSync(resolveApp("".concat(_this5.config.outputFilePath, "/index.").concat(_this5.config.target)), indexData);
            });
            return callback && callback(true);
          }
        });
      });
    }
  }, {
    key: "generateApiName",
    value: function generateApiName(_ref) {
      var path = _ref.path,
          _id = _ref._id;

      if (this.config.generateApiName) {
        return this.config.generateApiName(path, _id);
      } else {
        var reg = new RegExp("/", "g");
        var name = path.replace(reg, " ").trim();
        name = changeCase.pascalCase(name.trim());
        name += _id;
        return name;
      }
    }
  }, {
    key: "generateIndexCode",
    value: function generateIndexCode(apis) {
      var arr = apis.map(function (api) {
        return "import ".concat(api, " from './").concat(api, "'");
      });
      var importStr = arr.join("\n    ");
      var exportStr = "\nexport default {\n  ".concat(apis.join(",\n  "), "\n}\n    ");
      return "\n".concat(importStr, "\n\n").concat(exportStr, "\n    ");
    }
  }]);

  return Generator;
}();

var generator = /*#__PURE__*/Object.freeze({
	__proto__: null
});

var configTemplate = "\n const config = {\n  target: \"js\",\n  serverUrl: \"http://yapi.ywfe.com\",\n  outputFilePath: \"api\",\n  projectId: \"85\",\n  _yapi_token:\n    \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjI5MCwiaWF0IjoxNTk2MTEwNDQzLCJleHAiOjE1OTY3MTUyNDN9.J2LGFRr9vVj6pD43LkY0lNTQb6Bxk3Cz2H1m2zLrljE;\",\n  _yapi_uid: \"290\",\n  generateApiName: (path, id) => {\n    return `id${id}`;\n  },\n  generateApiFileCode: (api) => {\n    const method = api.method.toLocaleLowerCase();\n    const isParamsUrl = api.path.indexOf(\"{\") > -1;\n    const arr = [\n      `\n /**\n  * ${api.title}\n  * ${api.markdown || \"\"}\n  * ${api.path}\n  **/\n `,\n      \"import request from './../request'\",\n    ];\n    if (isParamsUrl) {\n      // \u5E26params \u683C\u5F0F\u53C2\u6570\n      const reg = /{.*?}/g;\n      const paramsKeys = api.path\n        .match(reg)\n        .map((ele) => ele.replace(\"{\", \"\").replace(\"}\", \"\"));\n      const paramsKeysStr = paramsKeys.reduce((prev, value) => {\n        prev += `${value}, `;\n        return prev;\n      }, \"\");\n      arr.push(\n        `export default (${paramsKeysStr} data={}) => request({\n           method: '${method}',\n           url: '${api.path.replace(/{/, \"'+\").replace(/}/, \"\")},\n          ${(() => {\n            if (api.method.toLocaleLowerCase() === \"get\") {\n              return \"params: data\";\n            }\n            return \"data: data\";\n          })()}\n        })`\n      );\n    } else {\n      arr.push(\n        `const http = (data={}) =>  request({\n          method: '${method}',\n          url: '${api.path}',\n          ${(() => {\n            if (api.method.toLocaleLowerCase() === \"get\") {\n              return \"params: data\";\n            }\n            return \"data: data\";\n          })()}\n        }) `,\n        `export default http`\n      );\n    }\n    return arr.join(`\n `);\n  },\n};\n\nmodule.exports = config;\n\n  ";
var configTemplate_1 = configTemplate;

var template = {
	configTemplate: configTemplate_1
};

var name = "apiCreate";
var version = "0.1.0";
var description = "api create";
var main = "dist/index.js";
var author = "qinyueshang";
var license = "MIT";
var engines = {
	node: ">=8.0.0"
};
var bin = {
	apiCreate: "./index.js"
};
var scripts = {
	build: "bili "
};
var dependencies = {
	ora: "^3.4.0",
	commander: "2.20.0",
	consola: "^2.3.0",
	prompts: "^2.0.4",
	"fs-extra": "^7.0.1",
	request: "^2.88.0",
	"request-promise-native": "^1.0.5"
};
var devDependencies = {
	bili: "^5.0.5"
};
var _package = {
	name: name,
	version: version,
	description: description,
	main: main,
	author: author,
	license: license,
	"private": true,
	engines: engines,
	bin: bin,
	scripts: scripts,
	dependencies: dependencies,
	devDependencies: devDependencies
};

var _package$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	name: name,
	version: version,
	description: description,
	main: main,
	author: author,
	license: license,
	engines: engines,
	bin: bin,
	scripts: scripts,
	dependencies: dependencies,
	devDependencies: devDependencies,
	'default': _package
});

var Generator = getCjsExportFromNamespace(generator);

var require$$0 = getCjsExportFromNamespace(_package$1);

function _await$1(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

var cli = require("commander");

function _invoke(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

var consola = require("consola");

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var fs = require("fs-extra");

function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }

        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }

    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }

    pact.s = state;
    pact.v = value;
    var observer = pact.o;

    if (observer) {
      observer(pact);
    }
  }
}



var _Pact = /*#__PURE__*/function () {
  function _Pact() {}

  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;

    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;

      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }

        return result;
      } else {
        return this;
      }
    }

    this.o = function (_this) {
      try {
        var value = _this.v;

        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };

    return result;
  };

  return _Pact;
}();

function _switch(discriminant, cases) {
  var dispatchIndex = -1;
  var awaitBody;

  outer: {
    for (var i = 0; i < cases.length; i++) {
      var test = cases[i][0];

      if (test) {
        var testValue = test();

        if (testValue && testValue.then) {
          break outer;
        }

        if (testValue === discriminant) {
          dispatchIndex = i;
          break;
        }
      } else {
        // Found the default case, set it as the pending dispatch case
        dispatchIndex = i;
      }
    }

    if (dispatchIndex !== -1) {
      do {
        var body = cases[dispatchIndex][1];

        while (!body) {
          dispatchIndex++;
          body = cases[dispatchIndex][1];
        }

        var result = body();

        if (result && result.then) {
          awaitBody = true;
          break outer;
        }

        var fallthroughCheck = cases[dispatchIndex][2];
        dispatchIndex++;
      } while (fallthroughCheck && !fallthroughCheck());

      return result;
    }
  }

  var pact = new _Pact();

  var reject = _settle.bind(null, pact, 2);

  (awaitBody ? result.then(_resumeAfterBody) : testValue.then(_resumeAfterTest)).then(void 0, reject);
  return pact;

  function _resumeAfterTest(value) {
    for (;;) {
      if (value === discriminant) {
        dispatchIndex = i;
        break;
      }

      if (++i === cases.length) {
        if (dispatchIndex !== -1) {
          break;
        } else {
          _settle(pact, 1, result);

          return;
        }
      }

      test = cases[i][0];

      if (test) {
        value = test();

        if (value && value.then) {
          value.then(_resumeAfterTest).then(void 0, reject);
          return;
        }
      } else {
        dispatchIndex = i;
      }
    }

    do {
      var body = cases[dispatchIndex][1];

      while (!body) {
        dispatchIndex++;
        body = cases[dispatchIndex][1];
      }

      var result = body();

      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
        return;
      }

      var fallthroughCheck = cases[dispatchIndex][2];
      dispatchIndex++;
    } while (fallthroughCheck && !fallthroughCheck());

    _settle(pact, 1, result);
  }

  function _resumeAfterBody(result) {
    for (;;) {
      var fallthroughCheck = cases[dispatchIndex][2];

      if (!fallthroughCheck || fallthroughCheck()) {
        break;
      }

      dispatchIndex++;
      var body = cases[dispatchIndex][1];

      while (!body) {
        dispatchIndex++;
        body = cases[dispatchIndex][1];
      }

      result = body();

      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
        return;
      }
    }

    _settle(pact, 1, result);
  }
}

function _async$1(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

var prompt = require("prompts");

var ora = require("ora");



var configTemplate$1 = template.configTemplate;

(function async() {
  var pkg = require$$0;

  var configFile = path.join(process.cwd(), "apiCreate.config.ts");
  cli.version(pkg.version).arguments("[cmd]").action(_async$1(function (cmd) {
    return _switch(cmd, [[function () {
      return "init";
    }, function () {
      return _await$1(fs.pathExists(configFile), function (_fs$pathExists) {
        return _invoke(function () {
          if (_fs$pathExists) {
            consola.info("\u68C0\u6D4B\u5230\u914D\u7F6E\u6587\u4EF6: ".concat(configFile));
            return _await$1(prompt({
              type: "confirm",
              name: "override",
              message: "是否覆盖已有配置文件?"
            }), function (answers) {
              if (!answers.override) ;
            });
          }
        }, function (_result2) {
          return  _await$1(fs.outputFile(configFile, configTemplate$1), function () {
            consola.success("写入配置文件完毕");
          });
        });
      });
    }], [function () {
      return "version";
    }, function () {
      console.log("\u5F53\u524D\u7248\u672C\u53F7 ".concat(pkg.version));
    }], [void 0, function () {
      return _await$1(fs.pathExists(configFile), function (_fs$pathExists2) {
        if (!_fs$pathExists2) {
          return consola.error("\u627E\u4E0D\u5230\u914D\u7F6E\u6587\u4EF6: ".concat(configFile));
        }

        consola.success("\u627E\u5230\u914D\u7F6E\u6587\u4EF6: ".concat(configFile));
        return _catch(function () {
          var config = commonjsRequire(configFile);

          var generator = new Generator(config);
          var spinner = ora("正在获取yapi数据样本").start();
          return _await$1(generator.generate(), function (output) {
            spinner.stop();
            consola.success("yapi数据样本已获取，开始写入");
            generator.write(output, function (isNew) {
              if (isNew) {
                consola.success("api创建已完成");
              }
            });
          });
        }, function (err) {
          return consola.error(err);
        });
      });
    }]]);
  })).parse(process.argv);
})();
