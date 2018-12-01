const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser');

const port = new SerialPort('/dev/ttyUSB0',{ baudRate: 57600 })
const parser = port.pipe(new EnoceanParser())

// get Base Adress of your TCM... not needed here, this is just to test Response type Packets
 port.write(Buffer.from("5500010005700838","hex"))

parser.on('data', console.log)
