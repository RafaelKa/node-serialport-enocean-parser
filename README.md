# serialport-enocean-parser

  The [EnOcean Serial Protocol 3 (ESP3)](https://www.enocean.com/esp) parser for [node-serialport](https://www.npmjs.com/package/serialport).

## Install

`npm i -S node-serialport-enocean-parser`

## How to use

    const SerialPort = require('serialport')
    const EnoceanParser = require('node-serialport-enocean-parser');

    const port = new SerialPort('/dev/ttyUSB0',{ baudRate: 57600 })
    const parser = port.pipe(new EnoceanParser())

    parser.on('data', console.log)
