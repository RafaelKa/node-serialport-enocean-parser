module.exports = function (buf) {
  var dl = parseInt(buf.slice(1, 3).toString('hex'), 16)
  var odl = buf[3]
  return {
    syncByte: 0x55,
    header: {
      dataLength: dl,
      optionalLength: odl,
      packetType: buf[4]
    },
    crc8Header: buf[5],
    data: buf.slice(6, 6 + dl),
    optionalData: buf.slice(6, 6 + dl + odl),
    crc8Data: buf[6 + dl + odl]
  }
}
