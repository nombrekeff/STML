
/*
  Tag class
  @author: keff
  @version: 0.1.0
*/

const utils = require("./utils")

/*
  Tag class for managing each tag, and give them some logic
*/
class Tag {
  constructor(cfig, styles) {
    this.ln = cfig.ln || 0;
    this.value = cfig.value || '';
    this.is = {
      var: utils.isVariable(this.value),
      function: utils.isStmlFunction(this.value),
      comment: utils.isComment(this.value)
    }
    this.isTagClosed = false;
    this.tabSpacing = utils.getTabSize(this.value);
    this.name = (this.is.comment || this.is.function)? '': utils.getName(this.value, this.tabSpacing, this.ln);
    this.tag = utils.formatTag(this.name);
    this.wasAppended = false;
    this.has = {
      id: utils.hasId(this.value),
      class: utils.hasClass(this.value),
      text: utils.hasText(this.value),
      attr: utils.hasAttribute(this.value)
    };
    this.childrenTags = [];
    this.styles = styles || [];
  }
  getClasses(){
    var chars = this.value.split("");
    var classes = "",
        i = 0,
        foundClasses = false,
        startPos = this.value.indexOf("("), endPos = this.value.indexOf(")");

    for (var i = startPos + 1; i < endPos; i++) {
      classes += chars[i];
    }
    classes = classes.replace(/\./g, "");
    return {
      classes,
      format: function() {
        return ` class="${classes}"`;
      }
    }

  }
  getId(){
    var id = "",
        i = 0,
        startPos = this.value.search("#"),
        chars = this.value.split("");

    for (i = startPos + 1; i < chars.length; i++) {
      let valid = /\w/.test(chars[i])
      if(valid){
          id += chars[i];
      }
      else{
          break;
      }
    }
    return {
      id,
      format: function() {
        return ` id="${id}"`
      }
    }
  }
  getAttr(){
    // console.log("TH", this.value);
    let attr = this.value.match(/\w*\[(.*)\]/)[1].replace(/,/g, "") || "";
    return attr
  }
  getTextStuff(){
    let text = (this.value.match(/[ ]*["']([\w $]*)["']/) || [null, null])[1];
    return text;
  }
  addChild(t){
    this.childrenTags.push(t);
  }
  generate(minify){
    let content = "";
    let ts = minify ? '': utils.generateTab(this.tabSpacing)
    let tag = ts + this.tag + "";
    // console.log("Generating tag", tag);
    if(this.name == "style"){
      let ind = tag.match(/source="#([\d]*)"/);
      if(ind[1]){
        content = this.styles[parseInt(ind[1])].replace(/source="#[\d]*"/, "");
      }
    }
    else{
      for (var i = 0; i < this.childrenTags.length; i++) {
       content += this.childrenTags[i].generate();
      }
    }

    return tag.replace(/@replace@/, content);
  }
}

module.exports = Tag;
