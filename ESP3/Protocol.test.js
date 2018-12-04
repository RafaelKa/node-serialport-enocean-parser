'use strict'

/* eslint-disable no-undef  */
const assert = require("chai").assert
const sinon = require("sinon")

const Protocol = require("./Protocol")

const ESP3Packet = require('./Packet')
const PacketTypes = require('./PacketTypes')

describe("ESP3", function () {
  it("can transform known packets to concrete packet types", function () {
    const ESP3 = new Protocol()
    const translatedPacket = ESP3.transformToConcretePacket({header: {packetType: 1}})
    assert.instanceOf(translatedPacket, PacketTypes.RADIO_ERP1)
  })

  // it("can plug new packet types to ", function () {
  //   const fakeESP3Packet = {header: {packetType: 1}}
  //   const esp3 = new ESP3({999: ESP3Packet})
  //   let translatedPacket = ESP3.translatePacket(fakeESP3Packet)
  //   assert.isPrototypeOf(ESP3Packet)
  // })
})
