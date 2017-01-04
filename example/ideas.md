Should have support for **'for'** loops:

My first idea was to do it as follows,  because it a nown way of doing it:
```javascript
@for($i = 0; i < 3; i++){
   span "var"+$i; // This should be a valid tag
 }

// Would result in:
span "var 0"
span "var 1"
span "var 2"
```
 When compiled should look like this
```html
<span>var 0</span>
<span>var 1</span>
<span>var 2</span>
```

#### Document declaration
*Should be at the top of the stml document*

Should declare the main document, so it ads the `html` tag and `<!DOCTYPE html>` to the top of the file:

1. More like the stml tag syntax `prefered`
```sass
@document#html(.no-js)[lang="es"]
```

2. This one has posibility to expand
```js
@document({
    lang:"es",
    class: "no-js",
    id: "html"
})
```
