const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser');

const port = new SerialPort('/dev/ttyUSB0',{ baudRate: 57600 })
const parser = port.pipe(new EnoceanParser())

parser.on('data', console.log)
