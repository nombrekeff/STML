# Stimule / STML
A simple html preprocessor made with nodejs, making It for fun


### Overview

```sass
div#target(.bold .row)[click="doX()"]
  div(.col-4)
    span "Heyy"
  div(.col-6)
    span "You like stones?"
```
The above piece of **stml** syntax will result in:

```html
<div id="target" class="bold row" click="doX()">
  <div class="col-4">
    <span>Heyy</span>
  </div>
  <div class="col-6 centered">
    <span>You like stones?</span>
  </div>
</div>
```

#### How to install it?
npm:
* *not supported yet*
```shell
$ npm install stimule -g
```

if you downloaded the project from github:
```shell
$ cd name/of/the/project
$ npm install -g
```
#### How to use it?
###### Via command line version:
```shell
$ cd where/the/stmlfile/is
$ stimule <input_file> [output_file]
```
You have to call stimule command with two parameters:

1. **input_file**  `#required`: should be a stml file

2. **output_file**  `#optional`:  the name/path for the output html file, defaults to the name of **input_file**
