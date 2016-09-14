source-map-builder
===================================
A better libaray to consume, generate and merge [source maps](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit).

Install
-----------------------------------
```
$ npm install source-map-builder
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Examples](#examples)
  - [Consuming a source map](#consuming-a-source-map)
  - [Generating a source map](#generating-a-source-map)
  - [Merging source maps](#merging-source-maps)
- [API](#api)
  - [new SourceMapBuilder(sourceMapData?)](#new-sourcemapbuildersourcemapdata)
  - [SourceMapBuilder.prototype.getSource(line, number)](#sourcemapbuilderprototypegetsourceline-number)
  - [SourceMapBuilder.prototype.eachMapping(callback, scope?)](#sourcemapbuilderprototypeeachmappingcallback-scope)
  - [SourceMapBuilder.prototype.addMapping(line, column, sourcePath?, sourceLine?, sourceColumn? name?)](#sourcemapbuilderprototypeaddmappingline-column-sourcepath-sourceline-sourcecolumn-name)
  - [SourceMapBuilder.prototype.addSource(sourcePath, sourceContent?)](#sourcemapbuilderprototypeaddsourcesourcepath-sourcecontent)
  - [SourceMapBuilder.prototype.addName(name)](#sourcemapbuilderprototypeaddnamename)
  - [SourceMapBuilder.prototype.setSourceContent(sourcePath, sourceContent)](#sourcemapbuilderprototypesetsourcecontentsourcepath-sourcecontent)
  - [SourceMapBuilder.prototype.getSourceContent(sourcePath)](#sourcemapbuilderprototypegetsourcecontentsourcepath)
  - [SourceMapBuilder.prototype.applySourceMap(other, file)](#sourcemapbuilderprototypeapplysourcemapother-file)
  - [SourceMapBuilder.prototype.toJSON()](#sourcemapbuilderprototypetojson)
  - [SourceMapBuilder.prototype.toString()](#sourcemapbuilderprototypetostring)
  - [SourceMapBuilder.prototype.computeLines()](#sourcemapbuilderprototypecomputelines)
  - [emitSourceMapUrl(content, sourceMapUrl, singleLineComment?)](#emitsourcemapurlcontent-sourcemapurl-singlelinecomment)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Examples
-----------------------------------
### Consuming a source map
```js
var rawSourceMap = {
  version: 3,
  file: 'min.js',
  names: ['bar', 'baz', 'n'],
  sources: ['one.js', 'two.js'],
  sourceRoot: 'http://example.com/www/js/',
  mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
};

var sourceMap = require("source-map-builder");
var smb = new sourcesmb.SourceMapBuilder(rawSourceMap);

console.log(smb.getSource(1, 28));
// { sourcePath: 'http://example.com/www/js/two.js',
//    line: 1,
//    column: 10,
//    name: 'n' }

smb.eachMapping(function(line, column, sourcePath, sourceContent, sourceLine, sourceColumn, name) {
    // ...
});
```

### Generating a source map
```js
var sourceMap = require("source-map-builder");
var smb = new sourcesmb.SourceMapBuilder({
  file: "source-mapped.js"
});

smb.addMapping(9, 35, "foo.js", 32, 2, "christopher");

console.log(smb.toJSON());
// { version: 3,
//   sources: [ 'foo.js' ],
//   mappings: ';;;;;;;;;mCAgCEA',
//   names: [ 'christopher' ] }
```

### Merging source maps
```js
var sourceMap = require("source-map-builder");
var smb1 = new sourcesmb.SourceMapBuilder();
var smb2 = new sourcesmb.SourceMapBuilder();

smb1.applySourceMap(smb2);
```

API
-----------------------------------
### new SourceMapBuilder(sourceMapData?)
An instance of the SourceMapBuilder represents a source map which is being built incrementally.
You may pass a raw source map data(eithor a string or a json) if you want to create a source map 
based on an existing one.
```js
// Create an empty source map.
var smb = new SourceMapBuilder(); 
```
```js
// Creates a source map from an existing source map.
var smb = new SourceMapBuilder('{"version":3,"file":"source-mapped.js","sources":["foo.js"],"names":["christopher"],"mappings":";;;;;;;;;mCAgCEA"}'); 
```

### SourceMapBuilder.prototype.getSource(line, number)
Returns the original source, line, and column information for the generated source's line and column positions provided. 

- `line`: The 0-based line number in the generated source.
- `column`: The 0-based column number in the generated source.

The object returned has the following properties:

- `sourcePath`: The original source file, or `undefined` if this information is not available.
- `sourceContent`: The original source content, or `undefined` if this information is not available.
- `line`: The 0-based line number in the original source, or `undefined` if this information is not available.
- `column`: The 0-based column number in the original source, or `undefined` if this information is not available.
- `name`: The original identifier, or `undefined` if this information is not available.

### SourceMapBuilder.prototype.eachMapping(callback, scope?)
Iterate over each mapping between an original source/line/column and a generated line/column in this source smb.

- `callback`: The function that is called with each mapping. `callback` receives these arguments:
    - `line`: The 0-based line number in the generated source.
    - `column`: The 0-based column number in the generated source.
    - `sourcePath`: The original source file, or `undefined` if this information is not available.
    - `sourceContent`: The original source content, or `undefined` if this information is not available.
    - `sourceLine`: The 0-based line number in the original source, or `undefined` if this information is not available.
    - `sourceColumn`: The 0-based column number in the original source, or `undefined` if this information is not available.
    - `name`: The original identifier, or `undefined` if this information is not available.
- `scope`: Optional. If specified, this object will be the value of this every time that callback is called.

```js
smb.eachMapping(function(line, column, sourcePath, sourceContent, sourceLine, sourceColumn, name) {
    console.log(line, column, sourcePath, sourceContent, sourceLine, sourceColumn, name);
});
```

### SourceMapBuilder.prototype.addMapping(line, column, sourcePath?, sourceLine?, sourceColumn? name?)
Add a single mapping from original source line and column to the generated source's line and column for this source map being created.

- `line`: The 0-based line number in the generated source.
- `column`: The 0-based column number in the generated source.
- `sourcePath`: Optional. The original source file.
- `sourceContent`: Optional. The original source content.
- `sourceLine`: Optional. The 0-based line number in the original source.
- `sourceColumn`: Optional. The 0-based column number in the original source.

```js
smb.addMapping(1, 2, "module-one.scm", 4, 5);
```

### SourceMapBuilder.prototype.addSource(sourcePath, sourceContent?)
Add a source and return the source index.

- `sourcePath`: The original source file.
- `sourceContent`: Optional. The original source content.

```js
var sourceIndex = smb.addSource("module-one.scm");
```

### SourceMapBuilder.prototype.addName(name)
Add a source and return the name index.

- `name`: The original identifier.

```js
var nameIndex = smb.addName("smb");
```

### SourceMapBuilder.prototype.setSourceContent(sourcePath, sourceContent)
Set the source content for an original source file.

- `sourcePath`: The original source file.
- `sourceContent`: The original source content.

```js
smb.setSourceContent("module-one.scm", fs.readFileSync("path/to/module-one.scm"));
```

### SourceMapBuilder.prototype.getSourceContent(sourcePath)
Get the source content for an original source file.

- `sourcePath`: The original source file.

```js
var content = smb.getSourceContent("module-one.scm");
```

### SourceMapBuilder.prototype.applySourceMap(other, file)
Applies a SourceMap for a source file to the Sourcesmb. 
Each mapping to the supplied source file is rewritten using the supplied Sourcesmb.

- `other`: Another source map builder to apply.
- `file`: Optional. The filename of the source file. If omitted, `other.file` will be used, if it exists. Otherwise an error will be thrown.

```js
var content = smb.getSourceContent("module-one.scm");
```

### SourceMapBuilder.prototype.toJSON()
Renders the source map being generated to a json.

```js
smb.toJSON()
// {"version":3,"sources":["module-one.scm"],"names":[],"mappings":"...snip...","file":"my-generated-javascript-file.js","sourceRoot":"http://example.com/app/js/"}
```

### SourceMapBuilder.prototype.toString()
Renders the source map being generated to a string.

```js
smb.toString()
// generator.toString()
// '{"version":3,"sources":["module-one.scm"],"names":[],"mappings":"...snip...","file":"my-generated-javascript-file.js","sourceRoot":"http://example.com/app/js/"}'
```

### SourceMapBuilder.prototype.computeLines()
Compute the missing line mappings.

```js
// Before:
smb.mappings
// [ undefined, undefined, [line:2, column: 1] ]

smb.computeLines()

// After:
smb.mappings
// [ [line: 0, column: 0], [line:1, column: 0], [line:2, column: 1] ]

```

### emitSourceMapUrl(content, sourceMapUrl, singleLineComment?)
Emit a `#sourceMappingURL` comment into content.

- `content`: The source content to emit.
- `sourceMapUrl`: The source map url to emit.
- `singleLineComment`: Optional. If set to `true`, prefer emiting `// #sourceMappingURL`.

```
var result = emitSourceMapUrl("", "foo.js.map");
// "\n/* #sourceMappingURL=foo.js.map */"
```
