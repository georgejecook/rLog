import * as fs from 'fs';
import * as path from 'path';

import { FileType } from './FileType';
import { LogHyperlinkStyle } from './LogHyperlinkStyle';

export default class FileDescriptor {

  constructor(directory, filename, extension) {
    this.filename = filename;
    this.directory = directory;
    this.extension = extension;
  }

  public filename: string;
  public directory: string;
  public extension: string;
  private _fileContents: string;

  get fileType(): FileType {
    switch (this.extension.toLowerCase()) {
      case '.brs':
        return FileType.Brs;
      default:
        return FileType.Other;
    }
  }

  public get fullPath() {
    return path.join(this.directory, this.filename);
  }

  public getPackagePath(projectRoot: string) {
    let pkgPath = `pkg:${this.fullPath.replace(projectRoot, '')}`;
    return pkgPath.replace('pkg://', 'pkg:/');
  }

  public getFileContents() {
    if (!this._fileContents) {
      this._fileContents = fs.readFileSync(this.fullPath, 'utf8');
    }
    return this._fileContents;
  }

  public setFileContents(newContents: string) {
    this._fileContents = newContents;
  }

  public saveFileContents() {
    fs.writeFileSync(this.fullPath, this._fileContents, 'utf8');
  }

  public unloadContents() {
    this._fileContents = null;
  }

  public toString() {
    return `DESCRIPTOR: ${this.filename} TYPE ${this.fileType} PATH ${this.fullPath}`;
  }
}
