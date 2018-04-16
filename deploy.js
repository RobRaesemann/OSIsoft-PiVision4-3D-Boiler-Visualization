'use strict';

const fse = require('fs-extra');
const path = require('path');
const libName = require('./package.json').name;
const process = require('process');
const rimraf = require('rimraf');
const argv = require('minimist')(process.argv.slice(2));

const novaFolder = argv.nova ? argv.nova : 'nova';
const isRelease = argv.r;

const destPath = path.join('..', 'Nova', 'src', 'assets', 'extensions', libName);
const assetPath = path.join('.', 'src', 'assets'); 
const distPath = path.join('.', 'dist');

const jsFile = libName + (isRelease ? '.min' : '') + '.js';
const mapFile = jsFile + '.map';

const config = { 
  preserveTimestamps: true,
  filter: (file) => {
    var o = path.parse(file);
    if (o.name.startsWith('.')) {
      console.log('Skipping', file);
      return false;
    } else {
      console.log('Copying', file);
      return true;
    }
  }
};

console.log('Cleaning destination', destPath);
rimraf.sync(destPath);

console.log('Copying', isRelease ? 'release' : 'debug', 'build files');
fse.copySync(path.join(distPath, jsFile), path.join(destPath, jsFile), config);

// we don't copy the the min.map file but we do build one
if (!isRelease) {
  fse.copySync(path.join(distPath, mapFile), path.join(destPath, mapFile), config);
}

fse.copySync(assetPath, path.join(destPath, 'assets'), config);
