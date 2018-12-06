const buffer2struct = require('./ESP3/buffer2struct.js')
const packetPrototypes = {
  0: require('./ESP3/ESP3Packet.js'),
  1: require('./ESP3/PacketTypes/RadioERP1.js'),
  2: require('./ESP3/PacketTypes/Response'),
  3: require('./ESP3/PacketTypes/RadioSubTel'),
  4: require('./ESP3/PacketTypes/Event'),
  5: require('./ESP3/PacketTypes/CommonCommand'),
  6: require('./ESP3/PacketTypes/SmartAckCommand'),
  7: require('./ESP3/PacketTypes/RemoteManCommand'),
  9: require('./ESP3/PacketTypes/RadioMessage'),
  0xa: require('./ESP3/PacketTypes/RadioERP2'),
  0x10: require('./ESP3/PacketTypes/Radio802'),
  0x11: require('./ESP3/PacketTypes/Command24')
}

module.exports = {
  'ESP3Packet': require('./ESP3/ESP3Packet.js'),
  'RadioERP1': require('./ESP3/PacketTypes/RadioERP1.js'),
  'Response': require('./ESP3/PacketTypes/Response'),
  'RadioSubTel': require('./ESP3/PacketTypes/RadioSubTel'),
  'Event': require('./ESP3/PacketTypes/Event'),
  'CommonCommand': require('./ESP3/PacketTypes/CommonCommand'),
  'SmartAckCommand': require('./ESP3/PacketTypes/SmartAckCommand'),
  'RemoteManCommand': require('./ESP3/PacketTypes/RemoteManCommand'),
  'RadioMessage': require('./ESP3/PacketTypes/RadioMessage'),
  'RadioERP2': require('./ESP3/PacketTypes/RadioERP2'),
  'Radio802': require('./ESP3/PacketTypes/Radio802'),
  'Command24': require('./ESP3/PacketTypes/Command24'),
  from: function (input) {
    if (input instanceof packetPrototypes[0]) {
      return new packetPrototypes[input.header.packetType](input)
    }
    if (input instanceof Buffer) {
      var struct = buffer2struct(input)
      return new packetPrototypes[struct.header.packetType](struct)
    }
    if (typeof input === 'string') {
      struct = buffer2struct(Buffer.from(input, 'hex'))
      return new packetPrototypes[struct.header.packetType](struct)
    }
    if (input.header && input.header.packetType) {
      return new packetPrototypes[input.header.packetType](input)
    } else {
      throw new Error('invalid packet descriptor')
    }
  }
}
