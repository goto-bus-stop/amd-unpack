var test = require('tape')
var vm = require('vm')
var bpack = require('browser-pack')
var concat = require('simple-concat')
var amdUnpack = require('..')

var abcSrc = `
  define('a', function () {
    return 10
  })
  define('b', ['a'], function (a) {
    return a * 2
  })
  define('c', ['b', 'a'], function (b, a) {
    return b / a
  })
`

test('defines', function (t) {
  t.plan(10)

  var modules = amdUnpack(abcSrc)

  t.equal(modules[0].id, 'a')
  t.equal(modules[1].id, 'b')
  t.equal(modules[2].id, 'c')

  t.ok(/return 10/.test(modules[0].source))
  t.ok(/require\("a"\)/.test(modules[1].source))
  t.ok(/require\("a"\)/.test(modules[2].source))
  t.ok(/require\("b"\)/.test(modules[2].source))

  t.equal(modules[1].deps.a, 'a')
  t.equal(modules[2].deps.a, 'a')
  t.equal(modules[2].deps.b, 'b')
})

test('commonjs', function (t) {
  t.plan(2)

  var modules = amdUnpack(abcSrc)
  var pack = bpack({ raw: true, standalone: 'c', standaloneModule: 'c' })
  concat(pack, function (err, res) {
    t.ifError(err)
    var bundle = res.toString()
    var ctx = { c: null }
    vm.runInNewContext(bundle, ctx)
    t.equal(ctx.c, 2)
  })
  modules.forEach(function (m) { pack.write(m) })
  pack.end()
})

test('sequence', function (t) {
  t.plan(3)
  var modules = amdUnpack('define("a", function(){}), define("b", function() {})')
  t.equal(modules.length, 2)
  t.equal(modules[0].id, 'a')
  t.equal(modules[1].id, 'b')
})

test('exports', function (t) {
  t.plan(5)
  var modules = amdUnpack('define("c",["a","exports"],function(a,b){b.x=a})')
  t.equal(modules.length, 1)
  t.equal(modules[0].id, 'c')
  t.equal(modules[0].deps.a, 'a')
  t.equal(Object.keys(modules[0].deps).length, 1) // should not have `exports`
  t.equal(modules[0].source, 'var a = require("a")\nexports.x=a')
})
