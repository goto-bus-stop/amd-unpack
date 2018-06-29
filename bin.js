#!/usr/bin/env node

var unpack = require('.')
var argv = require('minimist')(process.argv.slice(2))
var concat = require('simple-concat')

var usage = 'amd-unpack < file.js'

if (argv.h || argv.help) {
  console.error(usage)
  process.exit(1)
}

concat(process.stdin, function (err, contents) {
  if (err) throw err
  var modules = unpack(contents)
  if (!modules) {
    console.error('could not parse bundle')
    process.exit(1)
  }

  console.log('[')
  modules.forEach(function (row, index) {
    if (index > 0) console.log(',')
    console.log(JSON.stringify(row))
  })
  console.log(']')
})
