var colors = require('colors')

const IS_DEBUG = true
const IS_WARNNING = true
const DEBUG_LEVEL = 1
const DEBUG_TAG = ''

colors.setTheme({
  prompt: 'grey',
  info: 'green',
  warn: 'yellow',
  log: 'white',
  error: 'red'
})

export default class Debugger {
  tag: string = ''

  constructor(parent) {
    let type = typeof parent
    this.tag = (type == 'object') ? parent.constructor.name : parent
  }

  info(value, key = '') {
    log(this.tag,'info', value , key)
  }

  log(value, key = '', level=1) {
    if(!IS_DEBUG) return
    if(DEBUG_LEVEL > level) return
    if(DEBUG_TAG != "" &&  DEBUG_TAG != this.tag) return
    log(this.tag,'log', value , key)
  }

  error(value, key = '') {
    log(this.tag,'error', value , key)
  }

  warn(value, key = '') {
    if(!IS_WARNNING) return
    log(this.tag,'warn', value , key)
  }

}

export function log(tag, debugType, value , key = ''){
  let type = typeof value
  let header = '['+tag + ']' + ((key!='')? " "+key : "") + ' -> '
  if(type == 'object') {
    console[debugType](header.prompt)
    console.dir(value)
  } else {
    console[debugType](header.prompt + String(value)[debugType])
  }
}
