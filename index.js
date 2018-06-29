var assert = require('assert')
var acorn = require('acorn')
var astring = require('astring')
var isIdentifier = require('estree-is-identifier')

module.exports = function amdUnpack (source, opts) {
  var ast = typeof source === 'object' && typeof source.type === 'string'
    ? source
    : acorn.parse(source, { ecmaVersion: 2019 })

  if (opts && opts.source) {
    source = opts.source
  }

  if (source && Buffer.isBuffer(source)) {
    source = source.toString()
  }

  // nullify source if a parsed ast was given in the first parameter
  if (ast === source) {
    source = null
  }

  assert(!source || typeof source === 'string', 'amd-unpack: source must be a string or Buffer')

  var body = unwrapSequenceExpressions(ast.body)
  var modules = []

  body.forEach(function (node) {
    if (node.type === 'CallExpression' && isIdentifier(node.callee, 'define')) {
      ondefine(node)
    }
  })

  return modules

  function ondefine (node) {
    var args = node.arguments
    var name
    var factory
    var deps = []
    if (args.length >= 1 && args[0].type === 'Literal') {
      name = args[0].value
    }
    if (args.length >= 2 && args[1].type === 'ArrayExpression') {
      deps = args[1].elements.map(function (x) { return x.value })
    }
    if (args.length >= 2 && args[1].type === 'FunctionExpression') {
      factory = args[1]
    }
    if (args.length >= 3 && args[2].type === 'FunctionExpression') {
      factory = args[2]
    }

    if (!deps) deps = []

    if (!name) return
    if (!factory) return

    var range = getModuleRange(factory.body)
    var moduleSource = source
      ? source.slice(range.start, range.end)
      : astring.generate({
        type: 'Program',
        body: factory.body.body
      })

    // TODO use multisplice to replace the return statements
    moduleSource = 'module.exports = (function () {\n' + moduleSource + '\n}())'

    factory.params.forEach(function (param, i) {
      var dep = deps[i]
      moduleSource = 'var ' + astring.generate(param) + ' = require(' + JSON.stringify(dep) + ')\n' + moduleSource
    })

    modules.push({
      id: name,
      deps: deps.reduce(function (acc, dep) {
        acc[dep] = dep
        return acc
      }, {}),
      source: moduleSource
    })
  }
}

function unwrapSequenceExpressions (stmts) {
  var list = []
  stmts.forEach(function (st) {
    if (st.type === 'ExpressionStatement' && st.expression.type === 'SequenceExpression') {
      list = list.concat(st.expression.expressions)
    } else if (st.type === 'ExpressionStatement') {
      list.push(st.expression)
    } else {
      list.push(st)
    }
  })
  return list
}

function getModuleRange (body) {
  if (body.body.length === 0) {
    // exclude {} braces
    return { start: body.start + 1, end: body.end - 1 }
  }
  return {
    start: body.body[0].start,
    end: body.body[body.body.length - 1].end
  }
}
