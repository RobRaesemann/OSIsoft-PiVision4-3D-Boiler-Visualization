'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const libName = require('./package.json').name;

const config = { 
    preserveTimestamps: true,
    filter: (file, dest) => {
      var stats = fs.statSync(file)
      if (file.endsWith('.css') || file.endsWith('.html')) {
        console.log('Copying', file);
        return true;
      } 
      else if(stats.isDirectory()){
        return true;  
      } 
      else {
        return false;
      }
    }
  };

  fse.copySync("./src", "./out-tsc/tests-output", config);