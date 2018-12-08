const readline = require('readline')
const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser').FullParser
const Packet = require('../Packet.js')
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = port.pipe(new EnoceanParser())
const RockerSwitch = require('./simpleSwitchClass.js')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
var rocker

init()
rl.on('line', async (input) => {
  if (input === 'off') {
    await rocker.off()
  } else {
    rocker.on()
  }
})

// the following two function can also be abstracted away later...
async function init () {
  var offset = 1
  var idbase = await getBaseId()
  var addr = (idbase + offset).toString(16)
  console.log(`Your TCMs BaseId is ${addr}`)

  rocker = new RockerSwitch(addr, port, parser)
}

async function getBaseId () {
  var cc = new Packet.CommonCommand()
  cc.load({ data: Buffer.from('08', 'hex') }) // Common Command Code 08: CO_RD_IDBASE
  var res = await cc.send(port, parser)
  return parseInt(res.data.slice(1, 5).toString('hex'), 16)
}
