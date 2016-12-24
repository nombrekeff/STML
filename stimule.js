#!/usr/bin/env node
'use strict'

/*
  Main stimule file, import and commands
  @author: keff
  @version: 0.1.0


  This is the class that compiles the stml
*/
const StimuleCompiler = require("./lib/stml-compiler")




/*
  This is for getting additional comments and arguments,
  for the command line version
*/
const program = require('commander');

/* Colored cli shortened names */
const clc = require('cli-color');

const error  = clc.red.bold;
const warn   = clc.yellow;
const notice = clc.xterm(32);
const succs  = clc.green;

var pjson = require('./package.json');


/*
  Program definition and setts version
*/
program.version(pjson.version)
       .usage(notice('<command>') + " "+ clc.xterm(34)('[arguments]>'))
/*
  $ compile
  @param in_file #optional stml file
  @param out_file #optional html file
*/
program.command(
  '<target_file> [output_file]',
  `If no output_file name specified it default to target name`
)

// We set the action for previous command
program.action(compile);
/*
  Setts options for previous command
*/
program.option('-m, --minify', 'minify the output html');


/*
  We call parse with the current arguments
*/
program.parse(process.argv);

function compile(target_file, output_file, options) {
  // console.log(target_file, output_file);
  // We set options top process if there are
  let opts = {
    minify: program.minify || false
  };

  // Setting property in process for later use at compilment
  process.inputFile = target_file;

  // Calling Compile *defined below, with the recieved parameters
  Compile(target_file, output_file || null, opts);
}


/*
  This funciton creates a new StimuleCompiler

*/
function Compile(inFile, outFile, opts) {

  // Declares a new compiler for inFile
  var stmlCompiler = new StimuleCompiler(inFile, outFile, opts);

  // And calls compile on it
  stmlCompiler.compile(
      function(res, errors) {

        // Here we can handle the errors if there are
        if(errors.length > 0){

          // We loop over each error
          for(e in errors){
              console.log(error("Ooops, there where some errors: \n") , errors[e]);
          }
        }

        // If there are no errors it compiled ok
        else {
          console.log("Parsed '" + clc.bold(inFile) + "' with status: " +succs(res));
        }
    })
}
