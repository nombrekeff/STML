/*
  Meta tag handler class
  @author: keff
  @version: 0.1.0
*/

const utils = require("./utils")


// "include", "style", "for", "document"
class MetaTagHandler {
  constructor(compiler) {
    this.compiler = compiler;
    this.data = this.compiler.inFileData+"";
    this.has = this.doHasTests();
  }

  doHasTests(){
    let hasStyles = utils.Tests.style.test(this.data)
    return {
      styles: hasStyles
    }
  }

  handleStyles(){
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
  handle(callback){
    if (this.has.styles) {
      this.data = this.handleStyles();
    }
    if (this.has.include) {
      this.data = this.handleIncludes();
    }
    return this.data;
  }
}

module.exports = MetaTagHandler;
