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
  console.log(idbase)
}

// response is not from the receiver but from yor tcm300
function sendAndWaitForResponse (buf) {
  return new Promise((resolve, reject) => {
    var cb = data => {
      resolve(data)
      parser.removeListener('data', cb)
    }
    parser.on('data', cb)
    port.write(buf)
  })
}
