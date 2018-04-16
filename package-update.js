const fs = require('fs');
const path = require('path');
const semver = require('semver');

const DEFAULT_NOVA_PATH = '../Nova';
const DEFAULT_EXT_PATH = '.';
const PKG_JSON_FILE = 'package.json';
const PKG_LOCK_JSON_FILE = 'package-lock.json';

const update = (from, to) => {
  if (!from || !to) {
    return false;
  }

  const keys = Object.keys(to);
  let changed = false;
  keys.forEach((key) => {
    if (from[key]) {
      if (semver.gt(getVersion(from[key].version), getVersion(to[key]))) {
        changed = true;
        to[key] = from[key].version;
      }
    }
  });
  return changed;
};

const getVersion = (version) => {
  return (version && (version.startsWith('~') || version.startsWith('^'))) ?
    version.slice(1) : version;
};

const getJson = (path) => {
  try {
    return require(path);
  } catch (e) {
    console.log(`Error: JSON module ${path} could not be found. Sync process terminated!`);
    process.exit();
  }
};

const buildPath = (basePath, fileName, isNova) => {
  let dir;
  if (basePath) {
    dir = path.normalize(basePath);
    dir = (dir.endsWith('\\') || dir.endsWith('/')) ?
      dir.slice(0, dir.length - 1) : dir;
  } else {
    dir = !!isNova ? path.normalize(DEFAULT_NOVA_PATH) : path.normalize(DEFAULT_EXT_PATH);
  }

  // Node uses module path, rather than file system path,
  // so that requre('.\\package.json') would throw an error 
  dir = dir.replace(/[\\]/g, '/');
  return `${dir}/${fileName}`;
};

const writeToJson = (data, filePath) => {
  fs.writeFile(filePath, JSON.stringify(data, null, '  ') + '\n', (err) => {
    if (err) {
      console.log(`Error updating ${filePath}`);
    }
  });
};

// sync version from package-lock.json in Nova code base to local package.json
const syncPackage = (fromPath, toPath) => {
  let fromPkgLock = getJson(fromPath);
  let toPkg = getJson(toPath);
  let changed = false;

  let depUpdated = update(fromPkgLock.dependencies, toPkg.dependencies);
  let devDepUpdated = update(fromPkgLock.dependencies, toPkg.devDependencies);
  if (depUpdated || devDepUpdated) {
    writeToJson(toPkg, toPath);
  }
};

let baseNovaPath = '';
let baseExtPath = '';
if (process.argv.length >= 3) {
  baseNovaPath = process.argv[2];
  if (process.argv.length >= 4) {
    baseExtPath = process.argv[3];
  }
}

const novaPkgLockPath = buildPath(baseNovaPath, PKG_LOCK_JSON_FILE, true);
const extPkgPath = buildPath(baseExtPath, PKG_JSON_FILE, false);
syncPackage(novaPkgLockPath, extPkgPath);
console.log(`${extPkgPath} has been successfully updated to match PI Vision package versions.`);
