
/*
  Error handling
  @author: keff
*/


/*
  External libraries
*/
const fs       = require("fs")
const beautify = require('js-beautify').html
const clc      = require('cli-color');
const notice   = clc.xterm(32);
const succs    = clc.green;

class handler {
  constructor(compiler) {
    this.compiler = compiler;
  }
  error(msg, trace, i) {
    var tempString = this.compiler.inFileData.substring(0, i);
    var ln = tempString.split(/\n/g).length;
    var cn = i - tempString.length
    let error = {
      message: msg,
      at: `~/${process.inputFile} ${ln}:${cn}`,
      trace: trace
    }
    error = JSON.stringify(error, null, 4)
    throw error
  }
}


module.exports = {
  handler
};
