const ESP3Packet = require('../ESP3Packet.js')

class Event extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'EVENT'
    this.packetTypeNumber = 4
    const eventTypes = [
      { number: 0, name: 'undefined' },
      { number: 1, name: 'SA_RECLAIM_NOT_SUCCESSFUL' },
      { number: 2, name: 'SA_CONFIRM_LEARN' },
      { number: 3, name: 'SA_LEARN_ACK' },
      { number: 4, name: 'CO_READY' },
      { number: 5, name: 'CO_EVENT_SECUREDEVICES' },
      { number: 6, name: 'CO_DUTYCYCLE_LIMITCO_TRANSMIT_FAILED' }
    ]
    this.eventType = eventTypes[this.data[0]]
  }
}

module.exports = Event
