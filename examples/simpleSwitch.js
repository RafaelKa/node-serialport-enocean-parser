const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser').FullParser
const Packet = require('../Packet.js')
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = port.pipe(new EnoceanParser())

doit()

async function doit () {
  var cc = new Packet.CommonCommand()
  cc.load({ data: Buffer.from('08', 'hex') }) // Common Command Code 08: CO_RD_IDBASE
  var res = await sendAndWaitForResponse(cc.getRawBuffer()) // send the telegram asynchronously and wait for response.
  var idbase = res.data.slice(1, 5).toString('hex') // extract idbase
  if (process.argv.length > 3) process.argv.push('on')
  var mode = 0x10
  if (process.argv[2] === 'off') mode = 0x30

  var rockerSwitch = new Packet.RadioERP1()
  // Button down
  rockerSwitch.load({
    data: Buffer.from('f6' + mode.toString(16) + idbase + '20', 'hex'),
    optionalData: Buffer.from('03ffffffffff00', 'hex')
  })
  // Button up
  res = await sendAndWaitForResponse(rockerSwitch.getRawBuffer())
  if (res.responseType.number === 0) console.log('sending succesfull')
  rockerSwitch.load({
    data: Buffer.from('f600' + idbase + '20', 'hex'),
    optionalData: Buffer.from('03ffffffffff00', 'hex')
  })
  res = await sendAndWaitForResponse(rockerSwitch.getRawBuffer())
  if (res.responseType.number === 0) console.log('sending succesfull')
  port.close()
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
