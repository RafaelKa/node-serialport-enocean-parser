'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');

const Esp3Parser = require('../ESP3Parser');
var esp3parser = new Esp3Parser();

var telegrams = {
    _4BS_A5: '55000a0701eba5c87f710fffdba5e40001ffffffff47000d',
    _1BS_D5: '55000707017ad509ffdba5ed0001ffffffff470096',
    _VLD_D2: '55000c070196d24000b00a010001a03d790001ffffffff5b0033',
    _RPS_F6: '55000707017af600ffd9b7812001ffffffff460050',
    _4BS_Teach_In_A5:'55000a0701eba540300287ffd9b7e50001ffffffff440016'
};


describe('serialport enocean parser', function(){
    describe('ESP3Packet.getRawBuffer()', function() {
        it('returns identical buffer', function() {
            for (var key in telegrams) {
              const telegramm = Buffer.from(telegrams[key], 'hex');
              const spy = sinon.spy();
              const parser = new Esp3Parser();
              parser.on('data', spy);
              parser.write(telegramm);
              assert.equal(spy.getCall(0).args[0].getRawBuffer().toString('hex'), telegramm.toString('hex'));
            }
        });
    });
});
