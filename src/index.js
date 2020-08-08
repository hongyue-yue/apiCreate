#!/usr/bin/env node
import cli from 'commander'
import consola from 'consola'
import fs from 'fs-extra'
import path from 'path'
import prompt from 'prompts'
import ora from 'ora'
import Generator from './generator.js'
import {configTemplate} from './template.js'

(function async () {
  const pkg = require("../package.json");
  const configFile = path.join(process.cwd(), "apiCreate.config.ts");

  cli
    .version(pkg.version)
    .arguments("[cmd]")
    .action(async (cmd) => {
      switch (cmd) {
        case "init":
          if (await fs.pathExists(configFile)) {
            consola.info(`检测到配置文件: ${configFile}`);
            const answers = await prompt({
              type: "confirm",
              name: "override",
              message: "是否覆盖已有配置文件?",
            });
            if (!answers.override) return;
          }

          await fs.outputFile(configFile, configTemplate);
          consola.success("写入配置文件完毕");
          break;
        case "version":
          console.log(`当前版本号 ${pkg.version}`);
          break;
        default:
          if (!(await fs.pathExists(configFile))) {
            return consola.error(`找不到配置文件: ${configFile}`);
          }
          consola.success(`找到配置文件: ${configFile}`);
          try {
            const config = require(configFile);
            const generator = new Generator(config);

            const spinner = ora("正在获取yapi数据样本").start();
            const output = await generator.generate();
            spinner.stop();
            consola.success("yapi数据样本已获取，开始写入");
            generator.write(output, function (isNew) {
              if (isNew) {
                consola.success("api创建已完成");
              }
            });
          } catch (err) {
            return consola.error(err);
          }
          break;
      }
    })
    .parse(process.argv);
})();
