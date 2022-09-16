require('dotenv').config();
const key = process.env.TRON_PRO_API_KEY;
//https://api.trongrid.io/wallet/triggersmartcontract
const { ethers } = require('hardhat');
const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = '41';
const fetch = require('node-fetch');
const TronWeb = require('tronweb');

/*
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
  //  eventServer: 'https://api.someotherevent.io',
    privateKey: '07b1f080f3c674fcf7b284cd4a3ca4a232e213b78d676fd4d0a242d8eecbf3fe'
  });
console.log('tro',tronWeb);
let addressInHexFormat='TMJzeBma9zZrG95n5rNN7w3qLo4wCyrBrW'
const addressInBase58 = tronWeb.address.toHex(addressInHexFormat);
console.log('add',addressInBase58)*/
const url = 'https://api.trongrid.io/wallet/triggersmartcontract';
const options = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'TRON-PRO-API-KEY': key,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    owner_address: '417c6762a6bad35903b1ee3ae635b0c1e1757abcb1',
    // owner_address: 'TMJzeBma9zZrG95n5rNN7w3qLo4wCyrBrW',
    fee_limit: 100,

    contract_address: '41e2625945cdaa6e680c5e3102f6adc012fbde6a06',
    function_selector: 'check2()',
    //  call_value: false
  }),
};

//console.log('opti',options)

// const txHexDecoder = require('raw-transaction-hex-decoder');


describe('TronVvtecNfo', function () {
  it('fetch data', () => {
    fetch(url, options)
      .then((res) => res.json())
      .then(async (json) => {
        //let decodedTx = txHexDecoder.decodeBnbRawTx(json.result.message, 'Transfer');
        //console.log(JSON.stringify(decodedTx))
        let ares = ''; // await decodeParams(['uint256'],json.result.message,false);
        console.log('res', json);
        if (json.result && json.result.message) {
          let qq = Buffer.from(json.result.message, 'hex').toString('utf-8');
          console.log('w', json.result, qq);
        }
      })

      .catch((err) => {
        //
        //let bnbSend = 'ce01f0625dee0a4a2a2c87fa0a210a14d1a42a815fc6a339ecd8bfcd093dd1a835f40e1312090a03424e4210e8922612210a14e0a17a3ec9ddfd1d9c8b4e17df0622c679ffa89812090a03424e4210e89226126f0a26eb5ae987210298013db8d32124d1c11570cd37f8e52297bd18ea561cf990907f7aa03e486d6c1240ee378db6506d180dee42fdc54157c562fdd4d047a9c1c33ef407af6bd435a9023a2e0ebdb3061943a88b3a434d6b2ba8a4c970db218bd38fecf9796de973a43d182720cc011a097369676e61747572652001';
        //let decodedTx = txHexDecoder.decodeBnbRawTx(bnbSend, 'Transfer');
        // console.log(JSON.stringify(decodedTx));
        /*
        *
        * */

        console.error('error:' + err, err.code);
      });
  })
})
