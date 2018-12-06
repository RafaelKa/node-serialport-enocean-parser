const readline = require('readline')
const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser').FullParser
const Packet = require('../Packet.js')
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = port.pipe(new EnoceanParser())
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
var rocker

init()
rl.on('line', async (input) => {
  var mode = 0x10
  if (input === 'off') mode = 0x30
  // send button press event
  rocker.payload = mode
  res = await sendAndWaitForResponse(rocker.getRawBuffer())
  // send button release event
  rocker.payload = 0x00
  res = await sendAndWaitForResponse(rocker.getRawBuffer())
})

async function init () {
  var cc = new Packet.CommonCommand()
  cc.load({ data: Buffer.from('08', 'hex') }) // Common Command Code 08: CO_RD_IDBASE
  var res = await sendAndWaitForResponse(cc.getRawBuffer()) // send the telegram asynchronously and wait for response.
  var offset = parseInt(process.argv[2] ? process.argv[2] : 0)
  var idbase = parseInt(res.data.slice(1, 5).toString('hex'), 16)
  var addr = (idbase + offset).toString(16) // extract idbase
  rocker = prepareSwitch(addr)
  console.log(`
    Your TCMs BaseId is ${idbase.toString(16)}, 
    your channel offset is ${offset},
    that makes your current adress ${addr}

    Type "on" or "off" to switch your light on and off`)
}

function prepareSwitch (addr) {
  var rockerSwitch = new Packet.RadioERP1()
  rockerSwitch.load({
    data: Buffer.from(`f600${addr}20`, 'hex'),
    optionalData: Buffer.from('03ffffffffff00', 'hex')
  })
  return rockerSwitch
}

// response is not from the receiver but from yor tcm300
function sendAndWaitForResponse (buf) {
  return new Promise((resolve, reject) => {
    var cb = data => {
      if (data.header.packetType === 2) {
        resolve(data)
        parser.removeListener('data', cb)
      }
    }
    parser.on('data', cb)
    port.write(buf)
  })
}
