

function SplitBy(str, split) {
    return str.split(split);
}
function changeIndentationWithSlash(str) {
    return str.replace(/ /g, "-");
}
function getComment(str) {
  return str.match(/\/\/(.*)/)[1] ||""
}
function hasAttribute(str) {
  return /\[.*\]/.test(str)
}
function hasClass(str) {
  return /\(.*\)/.test(str)
}
function hasText(str) {
  return / ".*"/.test(str)
}
function hasId(str) {
  return /#[a-zA-Z][\w]+/.test(str)
}
function isVariable(str) {
  return /^\$/.test(str)
}
function isStmlFunction(str) {
    if(str.replace(/\s/g, "").startsWith("@")) return true;
    else return false;
}
function isComment(str) {
    if(str.replace(/\s/g, "").startsWith("//")) return true;
    else return false;
}
function parseVar(l) {
    var s = l.split("=");
    return {
        key: s[0].trim().replace(' ',''),
        value: s[1].trim().replace('"','').replace('"','')
    };
}
function generateTab(n) {
    var tab = "";
    if(n == 0){
        return "";
    }
    else{
        for (var i = 0; i < n; i++) {
            tab += " ";
        }
        return tab;
    }
}

function getName(array, tabSpace, ln) {
    var n = "",
        i = 0,
        foundId = false,
        startPos = tabSpace,
        line = array;

    for (i = startPos; i < line.length; i++) {
      // TODO: Make this better
      let valid = /[a-z\-]/.test(line[i])
      if(valid){
          n += line[i];
      }
      else{
        // console.log("Name", n);
        if(n == null || n == ""){
          let error = {
            message: `Invalid character '${line[i]}'`,
            at: `line ${(ln + 1)}: ${i}`,
            file: process.cwd() + "/"+process.inputFile
          }
          throw JSON.stringify(error, null, 4)
        }
        else
          return n;
      }
    }

}
function getTabSize(l) {
    var l = l.replace(/\s/g,"#");
    var tabSpacing = 0;
    for (var i = 0; i < l.length; i++) {
        if(l[i] == "#"){
            tabSpacing++;
        }else{
            return tabSpacing;
        }
    }
}
function formatTag(t) {
  if(t == ""){
      return "";
  }
  else{
      return "<"+t;
  }
}
function formatComment(str) {
  return `<!-- ${str} -->`;
}

const filters = {
    filterSlashR: (f) => {return f != "\r"},
    filterSlashN: (f) => {return f != "\n"},
    lineParamNotEmpty: (f) => {return f.value !=''},
    empty: (f) => {return f != ""},
    lines: (f) => {
        return !f.startsWith("$") && !f.startsWith("//") && !f.startsWith("@")
    },
    emptyTags: function (f) {return f.tag != ""},
};

const Status = {
    GOOD: "Success",
    BAD: "Error"
}

module.exports = {
  SplitBy,
  changeIndentationWithSlash,
  hasAttribute,
  hasClass,
  hasText,
  hasId,
  isVariable,
  isStmlFunction,
  isComment,
  parseVar,
  generateTab,
  getName,
  getTabSize,
  formatTag,
  getComment,
  formatComment,
  filters,
  Status,
  StmlRegex: {
    style: /@style\(([ a-zA-Z0-9.:;\-{}\n\r]*)\)/m
  },
  Tests: {
    style: /@style(.*)/,
    include: /@include(.*)/,
    document: /@document(.*)/
  }
}
