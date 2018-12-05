const ESP3Packet = require('../ESP3Packet.js')

class SmartAckCommand extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'SMART_ACK_COMMAND'
    this.packetTypeNumber = 6
    const commandTypes = [
      { number: 0, name: 'undefined' },
      { number: 1, name: 'SA_WR_LEARNMODE' },
      { number: 2, name: 'SA_RD_LEARNMODE' },
      { number: 3, name: 'SA_WR_LEARNCONFIRM' },
      { number: 4, name: 'SA_WR_CLIENTLEARNRQ' },
      { number: 5, name: 'SA_WR_RESET' },
      { number: 6, name: 'SA_RD_LEARNEDCLIENTS' },
      { number: 7, name: 'SA_WR_RECLAIMS' },
      { number: 8, name: 'SA_WR_POSTMASTER' }
    ]
    this.commandType = commandTypes[this.data[0]]
  }
}

module.exports = SmartAckCommand
