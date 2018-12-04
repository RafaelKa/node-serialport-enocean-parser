[![Build Status](https://travis-ci.com/RafaelKa/node-serialport-enocean-parser.svg?branch=master)](https://travis-ci.com/RafaelKa/node-serialport-enocean-parser)
![Coveralls github](https://img.shields.io/coveralls/github/RafaelKa/node-serialport-enocean-parser.svg)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# serialport-enocean-parser

  The [EnOcean Serial Protocol 3 (ESP3)](https://www.enocean.com/esp) parser for [node-serialport](https://www.npmjs.com/package/serialport).

## Install

`npm i -S serialport-enocean-parser`

## How to use

    const SerialPort = require('serialport')
    const EnoceanParser = require('node-serialport-enocean-parser');

    const port = new SerialPort('/dev/ttyUSB0',{ baudRate: 57600 })
    const parser = port.pipe(new EnoceanParser())

    parser.on('data', console.log)
