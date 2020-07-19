const chalk = require('chalk')

export type LogLevel = "verbose" | "info" | "silent"

export class Logger {
  _level: LogLevel
  _chalk: typeof chalk

  constructor(level: LogLevel = 'info') {
    this._chalk = chalk
    this._level = level
  }
  
  get _prefix() {
    return '[vue-type-audit] '
  }

  info(msg: any) {
    if (this._level !== 'silent') {
      console.log(this._prefix + this._chalk.green("info: ") + msg)
    }
  }

  warn(msg: string) {
    if (this._level !== 'silent') {
      console.log(this._prefix + this._chalk.yellow("warn: ") + msg)
    }
  }

  error(obj: string | Error) {
    if (this._level !== "silent") {
      if (typeof obj === "string") {
        console.error(this._prefix + this._chalk.red("error ") + obj);
      } else {
        console.error(this._prefix + this._chalk.red("error "), obj);
      }
    }
  }

  verbose(msg: string, ...objects: any[]) {
    if (this._level === "verbose") {
      console.log(this._prefix + this._chalk.green("debug ") + msg);
      if (objects && objects.length) {
        objects.forEach(obj => {
          console.log(this._chalk.gray(JSON.stringify(obj, null, 2)));
        });
      }
    }
  }

}