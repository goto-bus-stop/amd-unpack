# amd-unpack

extract modules from a bundled AMD project using define/require functions

[Install](#install) - [Usage](#usage) - [API](#api) - [License: Apache-2.0](#license)

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/amd-unpack.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/amd-unpack
[travis-image]: https://img.shields.io/travis/goto-bus-stop/amd-unpack.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/amd-unpack
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install amd-unpack
```

## Usage

Pipe a bundle to it:

```js
$ amd-unpack < bundle.js
[
{"id":0,"source":"exports.test=function(t){console.log(t)},exports.boop=\"beep\"","deps":{}}
,
{"id":1,"source":"var n,r,o=module.exports={};/*..snip..*/","deps":{}}
,
{"id":2,"source":"(function(t){function n(t,e){for(var n=0,r=t.length-1;r>=0;r--){var /*..snip..*/","deps":{"1":1}}
,
{"id":3,"source":"var r=require('a');require('b').test(r.join(\"whatever\",\"lol\"))","deps":{"a":0,"b":2}}
]
```

The output is a JSON array in the [module-deps][] format.

The output is rewritten to the CJS format:
```js
// input
define(['a', 'b'], function (c, d) {
  // xyz
  return z
})

// output
var c = require('a')
var d = require('b')

module.exports = (function () {
  // xyz
  return z
}())
```

## API

```js
var unpack = require('amd-unpack')
```

### `var modules = unpack(source)`

Return an array of [module-deps][] objects from the bundle source string `source`.

## License

[Apache-2.0](LICENSE.md)
