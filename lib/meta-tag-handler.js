/*
  Meta tag handler class
  @author: keff
  @version: 0.1.0
*/

const utils = require("./utils")
const clc      = require('cli-color');
const notice   = clc.xterm(32);
const succs    = clc.green;


// "include", "style", "for", "document"
class MetaTagHandler {
  constructor(compiler) {
    this.compiler = compiler;
    this.errorHandler = this.compiler.errorHandler
    this.data = this.compiler.inFileData+"";
    this.has = this.doHasTests();
  }

  doHasTests(){
    let hasStyles = utils.Tests.style.test(this.data)
    let hasForLoops = utils.Tests.fors.test(this.data)

    console.log(hasStyles, hasForLoops);
    return {
      styles: hasStyles,
      fors: hasForLoops
    }
  }

  handleStyles(){
    console.log("handleStyles");
    let styles = this.compiler.styles;
    return this.data.replace(utils.StmlRegex.style, function(a, b){
      styles.push(b);
      return 'style[source="#'+(styles.length - 1)+'"]';
    })
  }
  handleDocument(){

  }
  handleInclude(){

  }
  handleFors(){
    // succs("handleFors");
    let loops = this.compiler.forLoops;
    console.log("Test", utils.StmlRegex.forLoop.test(this.data));
    let data = this.data.match(utils.StmlRegex.forLoop);

    if(data){
      let vName  = data[2];
      let vValue = parseInt(data[3]);
      let cName  = data[5];
      let cCond  = data[6];
      let cVal   = parseInt(data[7]);
      let iValue = data[9];
      let iSgns  = data[10];

      let forContent  = data[12];

      let dummy = {};

      dummy.content = forContent;

      dummy.var = dummy[vName] = vValue;

      dummy.condition  = `dummy.${cName} ${cCond} ${cVal}`;
      dummy.operation  = `dummy.${iValue}${iSgns}`;
      dummy.evaledCond = eval(dummy.condition);

      /* test if vars are correct */

      if(dummy[cName] != dummy[vName]){
        this.errorHandler.error(
          `Variable ${cName} is not defined`,
          data[0],
          data.index
        )
      }
      if(dummy[iValue] != dummy[vName]){
        this.errorHandler.error(
          `Variable '${iValue}' is not defined`,
          data[0],
          data.index
        )
      }
      else {
        console.log(JSON.stringify(dummy, null, 4));
        return this.data.replace(utils.StmlRegex.forLoop, function(a, b){
          return iterate(dummy);
        })
      }
    }
    else {
      let vName  = data[2];
      let vValue = parseInt(data[3]);
      let cName  = data[5];
      let cCond  = data[6];
      let cVal   = parseInt(data[7]);
      let iValue = data[9];
      let iSgns  = data[10];
      console.log(`
        ${notice('vName')} : ${vName}
        ${notice('vValue')}: ${vValue}
        ${notice('cName')} : ${cName}
        ${notice('cCond')} : ${cCond}
        ${notice('cVal')}  : ${cVal}
        ${notice('iValue')}: ${iValue}
        ${notice('iSgns')} : ${iSgns}
      `);
      console.log(data);
      throw "Errorrrrr";
    }
  }

  handle(callback){
    // console.log("handling");

    if (this.has.styles) {
      this.data = this.handleStyles();
    }
    if (this.has.include) {
      this.data = this.handleIncludes();
    }
    if (this.has.fors) {
      this.data = this.handleFors();
    }
    return this.data;
  }
}
function iterate(dummy) {
  let s = "";
  let security = 0;
  while (dummy.evaledCond && security++ != 100000) {
    dummy.evaledCond = eval(dummy.condition);
    if(dummy.evaledCond){
      if(/\$\{.*\}/.test(dummy.content)){
        let cnt = dummy.content;
        cnt = dummy.content.replace(/\$\{([a-zA-Z ]*)\}/g, function (a, b) {
          console.log("reoplace", a, '-', b);
          return dummy[b];
        })
        s+= cnt;
      }
      else{
        s += dummy.content
      }
      eval(dummy.operation);
    }
  }
  return s;
}


module.exports = MetaTagHandler;
