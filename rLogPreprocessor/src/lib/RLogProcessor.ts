
import * as Debug from 'debug';
import * as fs from 'fs-extra';
import { Minimatch } from 'minimatch';
import * as M from 'minimatch';
import * as path from 'path';

import FileDescriptor from './FileDescriptor';

import { FileType } from './FileType';
import { LogHyperlinkStyle } from './LogHyperlinkStyle';
const debug = Debug('RLogProcessor');

export default class RLogProcessor {
  constructor(config) {
    this._config = config;
    if (!config.sourcePath) {
      throw new Error('Config does not contain sourcePath property');
    }
    if (!config.targetPath) {
      throw new Error('Config does not contain targetPath property');
    }
    this._sourcePath = config.sourcePath;
    this._targetPath = config.targetPath;
    this._logStyle = config.logStyle;
    this._warnings = [];
    this._errors = [];
    this.excludeMatcher = new Minimatch(config.exclude);
    let logStyleId = <string>config.logStyle; // Force string value here
    this._logStyle = LogHyperlinkStyle[logStyleId];
    this._isLogMethodRegex = new RegExp('^.*(logMethod|logWarn|logDebug|logInfo|logError|logVerbose).*', 'gim');
    this._logMethodAtStartRegex = new RegExp('(^.*)(logMethod|logWarn|logDebug|logInfo|logError|logVerbose).*\\((\\")', 'gim');
    this._logMethodAtEndRegex = new RegExp('(.*)(\\))$', 'gim');
    this._isLinkAtStart = this.isLinkAtStart(this._logStyle);
  }

  private readonly _config: object;
  private readonly _sourcePath: string;
  private readonly _targetPath: string;
  private readonly _logStyle: LogHyperlinkStyle;
  private readonly _warnings: string[];
  private readonly _errors: string[];
  private excludeMatcher: M.IMinimatch;
  private _isLogMethodRegex: RegExp;
  private _logMethodAtStartRegex: RegExp;
  private _logMethodAtEndRegex: RegExp;
  private _isLinkAtStart: boolean;

  get errors(): string[] {
    return this._errors;
  }

  get warnings(): string[] {
    return this._warnings;
  }

  get config(): object {
    return this._config;
  }

  get targetPath(): string {
    return this._targetPath;
  }

  get sourcePath(): string {
    return this._sourcePath;
  }

  public processFiles() {
    debug(`Running processor at path ${this._targetPath} `);

    //TODO - could have flag to do this in line.. and not copy stuff
    //example if this was part of someone's tool chain..
    this.clearFiles();
    this.copyFiles();
    this.processSourceFolder(this._sourcePath);
  }

  public copyFiles() {
    try {
      fs.copySync(this._sourcePath, this._targetPath);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Find all files inside a dir, recursively and convert to fileDescriptors
   * @function processSourceFolder
   * @param directory
   */
  public processSourceFolder(directory?: string) {
    directory = directory || this._sourcePath;

    debug(`processing files at path ${directory} `);
    //TODO - make async.
    //TODO - cachetimestamps for files - for performance
    fs.readdirSync(directory).forEach((filename) => {
      const fullPath = path.join(directory, filename);
      if (fs.statSync(fullPath).isDirectory()) {
        this.processSourceFolder(fullPath);
      } else {
        const extension = path.extname(filename).toLowerCase();
        if (extension === '.brs') {
          if (!this.excludeMatcher.match(directory)) {
            const fileDescriptor = new FileDescriptor(directory, filename, path.extname(filename));
            let text = this.getUpdatedLogInvocationText(fileDescriptor);
            fileDescriptor.setFileContents(text);
            fileDescriptor.saveFileContents();
          } else {
            this._warnings.push(`skipping excluded path ${directory}`);
          }
        }
      }
    });
  }

  /**
   * update the invocations in the file
   * @param directory
   * @param filename
   */
  public processBrsFile(directory, filename) {
  }

  public clearFiles() {
    fs.removeSync(this._targetPath);
  }

  public getUpdatedLogInvocationText(fileDescriptor: FileDescriptor): string {
    let text = fileDescriptor.getFileContents();
    const filePackageName = fileDescriptor.getPackagePath(this._targetPath);
    console.log(`filePackageName  ${filePackageName }`);
    let lines = text.split('\n');

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      if (this._isLogMethodRegex.test(lines[lineNumber])) {
        let hyperlinkText = this.getLogHyperlink(filePackageName, lineNumber + 1, this._logStyle);
        if (this._isLinkAtStart) {
          lines[lineNumber] = lines[lineNumber].replace(this._logMethodAtStartRegex, `$1$2("${hyperlinkText} `);
        } else {
          //place at end of arg
          lines[lineNumber] = lines[lineNumber].replace(this._logMethodAtEndRegex, `$1, "${hyperlinkText}")`);
        }
      }
    }
    return lines.join('\n');
  }

  public isLinkAtStart(logStyle: LogHyperlinkStyle): boolean {
    return logStyle === LogHyperlinkStyle.ShortAtStart || logStyle === LogHyperlinkStyle.NumberAtStart || logStyle === LogHyperlinkStyle.FullAtStart;
  }

  public getLogHyperlink(filePackageName: string, lineNumber: number, hyperlinkStyle: LogHyperlinkStyle): string {
    //TODO - imagine there will be some further config here to let vscode plugin know how to format this
    switch (hyperlinkStyle) {
      case LogHyperlinkStyle.NumberAtStart:
      case LogHyperlinkStyle.NumberAtEnd:
        return `${filePackageName}(${lineNumber})`;
      case LogHyperlinkStyle.ShortAtStart:
      case LogHyperlinkStyle.ShortAtEnd:
        return `${filePackageName}(${lineNumber})`;
      case LogHyperlinkStyle.FullAtEnd:
      case LogHyperlinkStyle.FullAtStart:
        return `${filePackageName}(${lineNumber})`;
    }
  }
}
