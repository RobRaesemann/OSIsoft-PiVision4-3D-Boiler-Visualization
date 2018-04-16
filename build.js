'use strict';

const fse = require('fs-extra'); 
const path = require('path'); 
const glob = require('glob');
const camelCase = require('camelcase');
const ngc = require('@angular/compiler-cli/src/main').main;
const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');
const resolve = require('rollup-plugin-node-resolve');
const commonJs = require('rollup-plugin-commonjs');

const inlineResources = require('./inline-resources');

const libName = require('./package.json').name;
const rootFolder = path.join(__dirname);
const srcFolder = path.join(rootFolder, 'src');
const distFolder = path.join(rootFolder, 'dist');

const compilationFolder = path.join(rootFolder, 'out-tsc');
const tempLibFolder = path.join(compilationFolder, 'build-src-copy');
const es5OutputFolder = path.join(compilationFolder, 'build-output');

console.log('Building');
exports.start = () => {
  return Promise.resolve()
  // Copy library to temporary folder and inline html/css.
  .then(() => fse.emptyDirSync(tempLibFolder))
  .then(() => fse.emptyDirSync(es5OutputFolder))
  .then(() => _relativeCopy(`**/*`, srcFolder, tempLibFolder)
    .then(() => inlineResources(tempLibFolder))
    .then(() => console.log('Inlining succeeded'))
  )
  // Compile to ES5.
  .then(() => ngc(['-p',`${tempLibFolder}/tsconfig.json`], (error) => {
      if (error) {
        throw new Error(error);
      }
  }))
  .then(() => console.log('Compilation succeeded'))
  // Bundle lib.
  .then(() => {
    // Base configuration.
    const es5Entry = path.join(es5OutputFolder, 'module.js');
    const rollupBaseConfig = {
      moduleName: camelCase(libName),
      sourceMap: true,
      globals: {
        '@angular/core': 'pivis.ngModules.core',
        '@angular/common': 'pivis.ngModules.common',
        '@angular/forms': 'pivis.ngModules.forms'
      },
      external: [
        '@angular/core',
        '@angular/common',
        '@angular/forms'
      ],
      onwarn: function (warning) {
        // see https://github.com/rollup/rollup/issues/794
        if (warning.code === 'THIS_IS_UNDEFINED') {
          return;
        }
        console.error(warning.message);
      },
      plugins: [
        resolve(),    // inlines npm package dependencies
        commonJs(),   // converts commonJS format modules to ES6
        sourcemaps()
      ]
    };

    // UMD bundle.
    const umdConfig = Object.assign({}, rollupBaseConfig, {
      entry: es5Entry,
      dest: path.join(distFolder, `${libName}.js`),
      format: 'umd',
    });

    // Minified UMD bundle.
    const minifiedUmdConfig = Object.assign({}, rollupBaseConfig, {
      entry: es5Entry,
      dest: path.join(distFolder, `${libName}.min.js`),
      format: 'umd',
      plugins: rollupBaseConfig.plugins.concat([uglify({})])
    });

    const allBundles = [
      umdConfig,
      minifiedUmdConfig,
    ].map(cfg => rollup.rollup(cfg).then(bundle => bundle.write(cfg)));

    return Promise.all(allBundles)
      .then(() => console.log('All bundles generated successfully'))
  })
  // copy asset files
  .then(() => {
    return fse.copy(path.join(rootFolder, 'src/assets'), path.join(distFolder, 'assets'));
  })
  // // Copy package files
  // .then(() => Promise.resolve()
  //   .then(() => _relativeCopy('LICENSE', rootFolder, distFolder))
  //   .then(() => _relativeCopy('package.json', rootFolder, distFolder))
  //   .then(() => _relativeCopy('README.md', rootFolder, distFolder))
  //   .then(() => console.log('Package files copy succeeded.'))
  // )
  .catch(e => {
    console.error('\Build failed, see below for errors\n');
    console.error(e);
    process.exit(1);
  });
};



// Copy files maintaining relative paths
function _relativeCopy(fileGlob, from, to) {
  return new Promise((resolve, reject) => {
    glob(fileGlob, { cwd: from, nodir: true }, (err, files) => {
      if (err) reject(err);
      files.forEach(file => {
        fse.copySync(path.join(from, file), path.join(to, file));
        resolve();
      });
    })
  });
}
