import * as chai from 'chai';
import * as fs from 'fs-extra';
import * as _ from 'lodash';

import { expect } from 'chai';

import FileDescriptor from './FileDescriptor';
import ProjectProcessor from './RLogProcessor';

const chaiSubset = require('chai-subset');
let dircompare = require('dir-compare');

chai.use(chaiSubset);
let config = require('../test/testProcessorConfig.json');
let processor: ProjectProcessor;

describe('Project Processor', function() {
  beforeEach(() => {
    config = _.clone(config);
    processor = new ProjectProcessor(config);
    fs.removeSync(config.targetPath);
  });

  describe('Initialization', function() {
    it('correctly sets source paths and config', function() {
      expect(processor.sourcePath).to.equal(config.sourcePath);
      expect(processor.targetPath).to.equal(config.targetPath);
      expect(processor.config).to.equal(config);

      //TODO look into correct babel compatible way to do this
      //expect(processor.fileMap instanceof ProjectFileMap).is.true; // this fails, and so does every other instance checking
    });

    it('allows overriding of filemap', function() {
      processor = new ProjectProcessor(config);

      expect(processor.sourcePath).to.equal(config.sourcePath);
      expect(processor.targetPath).to.equal(config.targetPath);
    });
  });

  describe('Copy files', function() {
    it('correctly copies files to target folder', () => {
      console.debug('copying files');
      processor.copyFiles();
      const options = { compareSize: true };
      const res = dircompare.compareSync(config.sourcePath, config.targetPath, options);
      expect(res.same).to.be.true;
      //console.debug(`finished ${res}`);
    });
  });

  describe('Clear files', function() {
    it('correctly clears target folder', () => {
      console.debug('copying files');
      processor.copyFiles();
      const options = { compareSize: true };
      const res = dircompare.compareSync(config.sourcePath, config.targetPath, options);
      expect(res.same).to.be.true;
      processor.clearFiles();
      expect(fs.pathExistsSync(config.targetPath)).to.be.false;
    });
  });

  describe('Process files', function() {
    beforeEach(() => {
      processor.copyFiles();
      processor.processSourceFolder(config.targetPath);
    });

    it('populates descriptors', () => {
      //TODO test warnings and errors!
      console.debug('finished processing map');
      console.debug('warnings');
      console.debug(processor.warnings);
      console.debug('errors');
      console.debug(processor.errors);
    });
  });

  describe('getUpdatedLogInvocationText', function() {
    it('replaces logCalls with logstyle ShortAtStart - no args', function() {
      const file = new FileDescriptor('/source', 'test.brs', '.brs');
      file.setFileContents(`someCode
        othercode
        logInfo("message")`);
      config = _.clone(config);
      config.logStyle = 'ShortAtStart';
      processor = new ProjectProcessor(config);

      expect(processor.getUpdatedLogInvocationText(file))
        .to.equal(`someCode
        othercode
        logInfo("pkg:/source/test.brs(3) message")`);
    });

    it('replaces logCalls with logstyle FullAtEnd - no args', function() {
      const file = new FileDescriptor('/source', 'test.brs', '.brs');
      file.setFileContents(`someCode
        othercode
        logInfo("message")`);
      config = _.clone(config);
      config.logStyle = 'FullAtEnd';
      processor = new ProjectProcessor(config);

      expect(processor.getUpdatedLogInvocationText(file))
        .to.equal(`someCode
        othercode
        logInfo("message", "pkg:/source/test.brs(3)")`);
    });
  });
});
