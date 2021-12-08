global.XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest
global.fetch = require('node-fetch')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document
