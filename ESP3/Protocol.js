/* jslint node: true */
'use strict'

const PacketTypes = require('./PacketTypes')
const ESP3Packet = require('./Packet')

class Protocol {

  constructor(options = {
    packetPrototypes: {}
  }) {
    this.packetPrototypes = {
      ...{
        // 0: '---',                          // Reserved
        1: PacketTypes.RADIO_ERP1,            // Radio telegram
        // 2: PacketTypes.RESPONSE,           // Response to any packet
        // 3: PacketTypes.RADIO_SUB_TEL,      // Radio subtelegram
        // 4: PacketTypes.EVENT,              // Event message
        // 5: PacketTypes.COMMON_COMMAND,     // Common command
        // 6: PacketTypes.SMART_ACK_COMMAND,  // Smart Ack command
        // 7: PacketTypes.REMOTE_MAN_COMMAND, // Remote management command
        // 8: '---',                          // Reserved for EnOcean
        // 9: PacketTypes.RADIO_MESSAGE,      // Radio message
        // 10: PacketTypes.RADIO_ERP2,        // ERP2 protocol radio telegram
        // // 11-15: '---'                    // Reserved for EnOcean
        // 16: PacketTypes.RADIO_802_15_4,    // 802_15_4_RAW Packet
        // 17: PacketTypes.COMMAND_2_4        // 2.4 GHz Command
        // 18-127: '---'                      // Reserved for EnOcean
        // 128-255: 'available'               // MSC and messages
      }, ...options.packetPrototypes
    }
    Object.freeze(this.packetPrototypes)
  }

  /**
   *
   * @param esp3Packet ESP3Packet
   */
  transformToConcretePacket(esp3Packet) {
    if (this.packetPrototypes[esp3Packet.header.packetType] === undefined) {
      throw new Error(`Packet Type $esp3Packet.header.packetType is not implemented.`)
      // return esp3Packet
    }
    let concretePacket = new this.packetPrototypes[esp3Packet.header.packetType](esp3Packet)
    Object.freeze(concretePacket)
    return concretePacket
  }

  create({packetType = 1, data = undefined, optionalData = undefined}) {
    // create
    const packet = new ESP3Packet() // @todo: implement factory methods, to make it possible tocreate packets from variing sources if needed
    return this.transformToConcretePacket(packet)
  }

}

module.exports = Protocol