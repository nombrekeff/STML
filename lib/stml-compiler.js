
/*
  StimuleCompiler class
  @author: keff
  @version: 0.1.0
*/


/*
let s = 'for($i = 0; i <= 32; i--){span}'
let forRegex = /for\(((\$[\w][\w\d]*)[ ]*=[ ]*([\d]*))[ ]*;[ ]*(([\w][\w\d]*)[ ]*([<=>!]*)[ ]*([\d\w]*))[ ]*;[ ]*((\w*)[ ]*([\+\=\-\*\/]*)[ ]*([\d\w]*))\)\{(.*)\}/


let res = s.match(forRegex);
console.log(res)
console.log("Var name: "+res[2])
console.log("Var value: "+res[3])
console.log("condition var: "+res[5])
console.log("condition var c: "+res[6])
console.log("condition var c value: "+res[7])

console.log("increment name: "+res[9])
console.log("increment / decrement sngs: "+res[10])
*/



/*
  External libraries
*/
const fs       = require("fs")
const beautify = require('js-beautify').html
const clc      = require('cli-color');
const notice   = clc.xterm(32);
const succs    = clc.green;



/*
  Internal files and stuffs
*/
const utils = require("./utils")
const Tag = require('./tag')
const MetaTagHandler = require('./meta-tag-handler')

/*
  StimuleCompiler makes all the compilment
*/
class StimuleCompiler {
  constructor(inFile, outFile, opts) {
    this.inFileName  = inFile;
    this.inFileData  = this.readFile(this.inFileName, 'utf8');
    this.OutFile     = outFile;
    this.opts        = {
                         minify: opts.minify || false
                       }
    this.lines       = [];
    this.cTags       = [];
    this.tags        = [];
    this.closingTags = [];
    this.parsedSTML  = [];
    this.scope       = [];
    this.isInFor     = false;
    this.filters     = utils.filters;
    this.Status      = utils.Status;
    this.lex         = JSON.parse(this.readFile("./lex/lex.json"));
    this.styles      = []

    // This class handles all the metatags
    this.mTagHandler = new MetaTagHandler(this)
    this.inFileData  = this.mTagHandler.handle();

    /* I split the file by lines and filter the empty lines */
    this.lines  = this.inFileData.split("\n").filter(this.filters.filterSlashR);
  }

  // Utils
  readFile(inFile, encoding) {
    return fs.readFileSync(inFile, encoding || "utf8")
  }
  writeFile(d, encoding) {
    if (!this.OutFile) {
      this.OutFile = this.inFileName.match(/([a-z]*)./)[1]+".html";
    }
    return fs.writeFileSync(this.OutFile, d, encoding || "utf8")
  }
  interpreteSTMLFunction(str, lstStr, doc) {
    var funct = str.replace("@","");
    var fName = utils.getName(funct.replace(/\s/g,""),{tabSpacing: 0});
    var that = this;
    function include(f) {
        return that.readFile(f);
    }
    switch (fName) {
      case "include":
        var tabS = utils.getTabSize(funct);
        var r = eval(funct).toString();
        return r
        break;
    }
  }
  getVarFromScope(v) {
    for (var i = 0; i < this.scope.length; i++) {
      if(v == this.scope[i].key){
        return this.scope[i].value;
      }
    }
  }

  /*
    Parses lines, and checks for errors
  */
  parseLine(l, ln) {

    /*
      We create a new Tag for that line
    */
    let tag = new Tag({
      value: l,
      ln: ln
    }, this.styles);

    /* We check if the Tag is a variable */
    if(tag.is.var){
      this.scope.push(utils.parseVar(tag.value));
      tag.isClosed = true;
      return tag;
    }

    /* We check if the Tag is a function */
    if(tag.is.function){
      tag.isClosed = true;
      let v = this.interpreteSTMLFunction(tag.value, this.lines[ln - 1], this.lines, l, ln);
      tag.tag = v;
      tag.isClosed = true;
      return tag;
    }

    /* We check if the Tag is a comment */
    if(tag.is.comment){
      let commentValue = utils.getComment(tag.value);
      tag.tag = utils.formatComment(commentValue);
      tag.isClosed = true;
      return tag;
    }

    /* Else it is "tag" */
    else{

      /* We check if the Tag has id */
      if(tag.has.id){
        let res = tag.getId();
        tag.id = res.id;
        tag.tag += res.format();
      }

      /* We check if the Tag has classes */
      if(tag.has.class){
        let res = tag.getClasses();
        tag.classes = res.classes;
        tag.tag += res.format();
      }

      /* We check if the Tag has attributes */
      if(tag.has.attr){
        let res = tag.getAttr();
        tag.tag += " " + res;
      }

      /* We check if the Tag is not selfClosing */
      if(!this.lex.selfClosing.includes(tag.name)){

        /* We check if the tag has text */
        if(tag.has.text){
          let res = tag.getTextStuff();

          /*
            here we check if it has any variable in the text and replace it
            with the value that is in the scope
           */
          if(res.match(/\$[a-z][A-Z]*/)){
              res = this.getVarFromScope(res);
          }

          tag.tag +=`>${res}</${tag.name}>`;
          tag.isClosed = true;
        }
        else{
          tag.tag +=`>@replace@</${tag.name}>`;
        }
      }

      /* else its selfClosing */
      else{
        tag.tag +=`>`;
        tag.isClosed = true;
      }

      /* We return the tag */
      return tag
    }
  }

  /*
    Compile function, this is the one called from the user || machine
  */
  compile(callback){
    var okey    = true,
        errors  = [],
        res     = this.Status.GOOD,
        lastTag = null;

    /*
      First it loops over all the lines and parses each line
      and checks for errors
    */
    for (var i = 0; i < this.lines.length; i++) {

      /*
        Here it parses the line, by passing the current line and the index to
        this.parseLine();
      */
      let parsedTag = this.parseLine(this.lines[i], i);

      /*
        It checks to see if it gave any errors when parsing
        if it is an error it pushes it to the errors array
        and breaks out the loop
      */
      if(typeof parsedTag == "error"){
        errors.push(parsedTag)
        break;
      }

      /*
        If there are no errors it checks if it is a valid tag
        if so it adds it to the tags array;
      */
      else if(parsedTag.value != '' && parsedTag.name != undefined){
        this.tags.push(parsedTag);
      }
    }//Endfor

    /*
      Now we check if there are no errors, if there are no errors,
      it transpiles the parsed stml to html
    */
    if(errors.length == 0){

      let filteredTags = [],
          parsedHTML  = ""

      /*
        We assume status okey is true at first,
        and if there are any errors it will change to false
        while compiling
      */
      okey = true;

      /*
        Here it loops throw all the tags and checks indentation level,
        and appends children to its parent for later nesting situation,
        we start at index 1 because firts tag never going to have daddy xD
      */
      for (var i = 1; i < this.tags.length; i++) {

        /*
          I define the curret tag, and the previous tag
          and there indentation size
        */
        let cTag = this.tags[i],
            bTag = this.tags[i-1],
            cSpacing = cTag.tabSpacing,
            bSpacing = bTag.tabSpacing;

        /*
          If the current tag has less indentation than the next one
          Should append next one to current
        */
        if(bSpacing < cSpacing){
          /*
            We set wasAppended to cTag so we now its in a parent tag
            and delete rebundant stuff later;
          */
          cTag.wasAppended = true;

          // And we append it to the previous tag bTag
          bTag.addChild(cTag);
        }


        /*
          Else if the indentation is equals, it should search for the parent
          and append it to that
        */
        else if(bSpacing == cSpacing){
          let sec = 0,
              tags = this.tags;

          /*
            This function recursively goes throw the previous tags
            and search for the closest parent, that is if it has more
            indentation than the current tag
          */

          function check(tag, i_) {
            if(tag){
              let bSpace = tag.tabSpacing || 0;
              if(sec < 100000 && tag){
                if(bSpace < cSpacing){
                  cTag.wasAppended = true;
                  tag.addChild(cTag);
                }
                else{
                  cTag.wasAppended = false;
                  check(tags[i_-1], i_-1)
                }
                sec++;
              }
            }
          }
          check(bTag, i-1)
        }
      }
      // console.log("", this.tags);
      /*
        Now we filter the tags array, letting the ones that were not
        appended, I delete them after so i dont change the array while loops
        and recursion happening
      */
      filteredTags = this.tags.filter(e => !e.wasAppended)

      /*
        Here we loop throw the filteredTags and generate the html for them
      */
      for (var i = 0; i < filteredTags.length; i++) {
        parsedHTML += filteredTags[i].generate(this.opts.minify)
      }

      /*
        Now we add the DOCTYPE, and the html tag
      */

      parsedHTML =
        `<!DOCTYPE html>
        <html>${parsedHTML}</html>`


      // If minify option true we dont format the ouptut html
      if(this.opts.minify){
        /* Nothing here yet */
      }

      /*
        else we pass the parsedHTML to beautify, and it will format and indend
        the output html
      */
      else{
        parsedHTML = beautify(
          parsedHTML,
          {
            indent_inner_html: true,
            indent_size: 2,
            unformatted: [
                // https://www.w3.org/TR/html5/dom.html#phrasing-content
                'abbr', 'area', 'audio', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
                'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'iframe', 'img',
                'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
                'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
                'strong', 'sub', 'sup', 'template', 'textarea', 'time', 'u', 'var',
                'video', 'wbr', 'text',
                // prexisting - not sure of full effect of removing, leaving in
                'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt',
                'pre',
            ]
          }
        );
      }

      /*
        Finnaly we write the output html file
      */
      this.writeFile(parsedHTML);
    }

    /*
      If there are errors we set status okey to false
    */
    else{
      okey = false;
    }

    /*
      And we set the response to the corresponding Status constant
    */
    if(okey == false){res == this.Status.BAD}
    if(okey == true){res == this.Status.GOOD}
    // console.log("ABBASBDB");
    /*
      And to finish, if it has a callback function, we call it with the
      response (res), and the errors
    */
    if(typeof callback == "function"){
      callback(res, errors);
    }
  }
}

module.exports = StimuleCompiler;
