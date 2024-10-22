'use strict';

const IOptimismMintableZTP20 = {
  remoteToken: function() {
    return this;
  },
  bridge: function() {
    return this;
  },
  mint: function() {
    return this;
  },
  burn: function() {
    return this;
  }
};

const IZIP165 = {
  supportsInterface: function() {
    return this;
  }
};

function implementsInterface(obj, interfaceObj) {
  let keys = Object.keys(interfaceObj);
  let i;
  for (i = 0; i < keys.length; i += 1) {
    if (!obj.hasOwnProperty(keys[i]) || typeof obj[keys[i]] !== "function") {
      return false;
    }
  }
  return true;
}

const OptimismMintableZTP20Class = function() {
  this.remoteToken = function() {
    Chain.tlog('remoteToken1');
  };

  this.bridge = function() {
    Chain.tlog('bridge1');
  };

  this.mint = function() {
    Chain.tlog('mint1');
  };

  this.burn = function() {
    Chain.tlog('burn1');
  };

  this.supportsInterface = function(interfaceId) {
    let iface1 = Utils.sha256(JSON.stringify(IZIP165), 1);
    let iface2 = Utils.sha256(JSON.stringify(IOptimismMintableZTP20), 1);
    return interfaceId === iface1 || interfaceId === iface2;
  };
};

const OptimismMintableZTP20 = new OptimismMintableZTP20Class();

function init(input_str) {
  let input = JSON.parse(input_str);

  Utils.assert(implementsInterface(OptimismMintableZTP20, IOptimismMintableZTP20), 'OptimismMintableZTP20 does not implement IOptimismMintableZTP20');
  Utils.assert(implementsInterface(OptimismMintableZTP20, IZIP165), 'OptimismMintableZTP20 does not implement IZIP165');

  return true;
}

function main(input_str) {
  let input = JSON.parse(input_str);
  let params = input.params;

  let result = {};
  if (input.method === 'mint') {
    OptimismMintableZTP20Class.mint();
  } else {
    throw 'Unknown operating: ' + input.method + '.';
  }
  return JSON.stringify(result);

}

function query(input_str) {
  let input = JSON.parse(input_str);
  let params = input.params;

  let result = {};
  if (input.method === 'supportsInterface') {
    result.data = OptimismMintableZTP20.supportsInterface(params.interfaceId);
  } else {
    throw 'Unknown operating: ' + input.method + '.';
  }

  return JSON.stringify(result);
}
