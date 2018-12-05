const ESP3Packet = require('../ESP3Packet.js')

class Response extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'RESPONSE'
    this.packetTypeNumber = 2
    const responseTypes = [
      { number: 0, name: 'RET_OK' },
      { number: 1, name: 'RET_ERROR' },
      { number: 2, name: 'RET_NOT_SUPPORTED' },
      { number: 3, name: 'RET_WRONG_PARAM' },
      { number: 4, name: 'RET_OPERATION_DENIED' },
      { number: 5, name: 'RET_LOCK_SET' },
      { number: 6, name: 'RET_BUFFER_TO_SMALL' },
      { number: 7, name: 'RET_NO_FREE_BUFFER' }
    ]
    this.responseType = responseTypes[this.data[0]]
  }
}

module.exports = Response
