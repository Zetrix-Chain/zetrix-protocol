'use strict';

const BasicOperation = function() {

  this.loadObj = function(key) {
    let data = Chain.load(key);
    if (data !== false) {
      return JSON.parse(data);
    }

    return false;
  };

  this.saveObj = function(key, value) {
    let str = JSON.stringify(value);
    Chain.store(key, str);
  };

  this.delObj = function(key) {
    Chain.del(key);
  };

  this.getKey = function(k1, k2, k3 = '', k4 = '') {
    return (k4 === '') ? (k3 === '') ? (k1 + '_' + k2) : (k1 + '_' + k2 + '_' + k3) : (k1 + '_' + k2 + '_' + k3 + '_' + k4);
  };
};

function implementsInterface(obj, interfaceObj) {
  let keys = Object.keys(interfaceObj);
  let i;
  for (i = 0; i < keys.length; i += 1) {
    if (!obj.hasOwnProperty(keys[i]) ||
      typeof obj[keys[i]] !== 'function') {
      return false;
    }
  }
  return true;
}

const IZEP165 = {
  supportsInterface: function() {
    return this;
  }
};

const IZTP20 = {
  totalSupply: function() {
    return this;
  },
  balanceOf: function() {
    return this;
  },
  transfer: function() {
    return this;
  },
  allowance: function() {
    return this;
  },
  approve: function() {
    return this;
  },
  transferFrom: function() {
    return this;
  }
};

const IZTP20Metadata = {
  name: function() {
    return this;
  },
  symbol: function() {
    return this;
  },
  decimals: function() {
    return this;
  }
};

/**
 * SPDX-License-Identifier: MIT
 * Reference : https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 */

/**
 * Represents the ZTP20 standard token implementation, providing functionality such as transferring, minting,
 * burning tokens, managing balances and allowances, and maintaining token-specific metadata like name, symbol,
 * and decimals.
 *
 * The ZTP20 features are implemented using a set of defined utility functions and consistent state management.
 *
 * @return {Object} A ZTP20 token implementation with methods to interact with and manipulate token-related data.
 */
const ZTP20 = function() {

  const BasicOperationUtil = new BasicOperation();

  const BALANCES_PRE = 'balances';
  const ALLOWANCES_PRE = 'allowances';
  const CONTRACT_INFO = 'contract_info';
  const ZTP_PROTOCOL = 'ztp20';
  const EMPTY_ADDRESS = '0x';

  const self = this;

  self.p = {/*protected function*/ };

  self.supportsInterface = function(paramObj) {
    let interfaceId = paramObj.interfaceId;
    let iface1 = Utils.sha256(JSON.stringify(IZEP165), 1);
    let iface2 = Utils.sha256(JSON.stringify(IZTP20), 1);
    let iface3 = Utils.sha256(JSON.stringify(IZTP20Metadata), 1);
    return interfaceId === iface1 || interfaceId === iface2 || interfaceId === iface3;
  };

  self.contractInfo = function() {
    return BasicOperationUtil.loadObj(CONTRACT_INFO);
  };

  self.p.init = function(name, symbol, describe = '', decimals = '6', supply = '0', version = '1.0.0') {
    BasicOperationUtil.saveObj(CONTRACT_INFO, {
      name: name,
      symbol: symbol,
      decimals: decimals,
      describe: describe,
      version: version,
      supply: supply,
      protocol: ZTP_PROTOCOL,
      issuer: Chain.msg.sender
    });
  };

  self.name = function() {
    let info = BasicOperationUtil.loadObj(CONTRACT_INFO);
    return info.name;
  };

  self.symbol = function() {
    let info = BasicOperationUtil.loadObj(CONTRACT_INFO);
    return info.symbol;
  };

  self.decimals = function() {
    let info = BasicOperationUtil.loadObj(CONTRACT_INFO);
    return info.decimals;
  };

  self.totalSupply = function() {
    let info = BasicOperationUtil.loadObj(CONTRACT_INFO);
    let supply = info.supply;
    if (supply === false) {
      supply = '0';
    }
    return supply;
  };

  self.balanceOf = function(paramObj) {
    let balance = BasicOperationUtil.loadObj(BasicOperationUtil.getKey(BALANCES_PRE, paramObj.account));
    if (balance === false) {
      balance = '0';
    }
    return balance;
  };

  self.p.update = function(from, to, value) {
    let totalSupply = self.totalSupply();
    if (from === EMPTY_ADDRESS) {
      totalSupply = Utils.int256Add(totalSupply, value);
    } else {
      let fromBalance = self.balanceOf({
        account: from
      });
      Utils.assert(Utils.int256Compare(fromBalance, value) >= 0, 'ERC20: Insufficient balance ' + from + ', ' + fromBalance + ', ' + value);
      fromBalance = Utils.int256Sub(fromBalance, value);
      BasicOperationUtil.saveObj(BasicOperationUtil.getKey(BALANCES_PRE, from), fromBalance);
    }
    if (to === EMPTY_ADDRESS) {
      totalSupply = Utils.int256Sub(totalSupply, value);
    } else {
      let toBalance = self.balanceOf({
        account: to
      });
      toBalance = Utils.int256Add(toBalance, value);
      BasicOperationUtil.saveObj(BasicOperationUtil.getKey(BALANCES_PRE, to), toBalance);
    }

    let info = BasicOperationUtil.loadObj(CONTRACT_INFO);
    info.supply = totalSupply;
    BasicOperationUtil.saveObj(CONTRACT_INFO, info);

    Chain.tlog('Transfer', from, to, value);
  };

  /**
   * Private function to execute a transfer of a specified value between two addresses.
   * Ensures the validity of the provided sender and receiver addresses before performing the transfer.
   *
   * @function
   * @param {string} from - The address of the sender initiating the transfer.
   * @param {string} to - The address of the recipient receiving the transfer.
   * @param {number} value - The amount to be transferred between the specified addresses.
   *
   * @returns {void}
   */
  const _transfer = function(from, to, value) {
    Utils.assert(Utils.addressCheck(from), 'ERC20: Invalid sender ' + from);
    Utils.assert(Utils.addressCheck(to), 'ERC20: Invalid receiver ' + to);

    self.p.update(from, to, value);
  };

  /**
   * Internal function to approve the transfer by spender account.
   *
   * @param {string} owner Account address of token owner
   * @param {string} spender Account address of token spender
   * @param {string} value Amount of token to be approved for transfer
   * @param {boolean} emitEvent Flag to enable log
   *
   * @returns {void}
   */
  self.p.approve = function(owner, spender, value, emitEvent = true) {
    Utils.assert(Utils.addressCheck(owner), 'Invalid approver');
    Utils.assert(Utils.addressCheck(spender), 'Invalid spender');
    BasicOperationUtil.saveObj(BasicOperationUtil.getKey(ALLOWANCES_PRE, owner, spender), value);
    if (emitEvent) {
      Chain.tlog('Approval', owner, spender, value);
    }
  };

  /**
   * Internal function to mint amount of token to recipient address.
   *
   * @param {string} account Account address of token mint recipient
   * @param {string} value Amount of token to be minted
   *
   * @returns {void}
   */
  self.p.mint = function(account, value) {
    Utils.assert(Utils.addressCheck(account), 'ERC20: Invalid receiver');
    self.p.update(EMPTY_ADDRESS, account, value);
  };

  /**
   * Function to transfer amount of token to the recipient
   *
   * @param {Object} paramObj The parameter object containing:
   * - to: The address of the token recipient.
   * - value: Amount of token to be transferred.
   *
   * @returns {boolean} true if successful.
   */
  self.transfer = function(paramObj) {
    _transfer(Chain.msg.sender, paramObj.to, paramObj.value);
    return true;
  };

  /**
   * Internal function to burn amount of token from personal keeps.
   *
   * @param {string} account Account address of token owner
   * @param {string} value Amount of token to be burned
   *
   * @returns {void}
   */
  self.p.burn = function(account, value) {
    Utils.assert(Utils.addressCheck(account), 'ERC20: Invalid sender');
    self.p.update(account, EMPTY_ADDRESS, value);
  };

  /**
   * Represents the allowance or permitted amount.
   * This property is used to track or manage the allowable limit
   * or allocation for a specific purpose.
   *
   * @param {Object} paramObj The parameter object containing:
   * - owner: The address of the token owner.
   * - spender: The address of the token spender.
   *
   * @returns {string} allowed value.
   */
  self.allowance = function(paramObj) {
    let allowance = BasicOperationUtil.loadObj(BasicOperationUtil.getKey(ALLOWANCES_PRE, paramObj.owner, paramObj.spender));
    if (allowance === false) {
      allowance = '0';
    }
    return allowance;
  };

  /**
   * Approves token to be transferred by specific account.
   *
   * @param {Object} paramObj The parameter object containing:
   * - spender: The address of the token spender.
   * - value: The amount of tokens to be approved for transfer.
   *
   * @returns {boolean} true if successful.
   */
  self.approve = function(paramObj) {
    self.p.approve(Chain.msg.sender, paramObj.spender, paramObj.value);
    return true;
  };

  /**
   * Private function to adjust the spending allowance for a specific spender on behalf of the owner.
   *
   * This function checks if the spender has sufficient allowance for the requested value,
   * subtracts the value from the current allowance, and updates the allowance accordingly.
   * If the spender's allowance is insufficient, an assertion error is thrown.
   *
   * @param {string} owner - The address of the owner who granted the allowance.
   * @param {string} spender - The address of the spender whose allowance is being adjusted.
   * @param {string} value - The amount to be deducted from the spender's current allowance.
   */
  self.p.spendAllowance = function(owner, spender, value) {
    let currentAllowance = self.allowance({
      owner: owner,
      spender: spender
    });
    Utils.assert(Utils.int256Compare(currentAllowance, value) >= 0, 'ERC20: Insufficient allowance spender: ' + spender + ', currentAllowance: ' + currentAllowance + ', value: ' + value);
    self.p.approve(owner, spender, Utils.int256Sub(currentAllowance, value), false);
  };

  /**
   * Transfers tokens from one address to another using the allowance mechanism.
   * The sender must have sufficient allowance from the `from` address to execute the transaction.
   *
   * @param {Object} paramObj The parameter object containing:
   * - from: The address of the token owner.
   * - to: The address of the token recipient.
   * - value: The amount of tokens to be transferred.
   *
   * @returns {boolean} true if successful.
   */
  self.transferFrom = function(paramObj) {
    let spender = Chain.msg.sender;
    self.p.spendAllowance(paramObj.from, spender, paramObj.value);
    _transfer(paramObj.from, paramObj.to, paramObj.value);
    return true;
  };

};

const ZTP20Inst = new ZTP20();

function mint(paramObj) {
  ZTP20Inst.p.mint(paramObj.account, paramObj.value);
}

function burn(paramObj) {
  ZTP20Inst.p.burn(paramObj.account, paramObj.value);
}

function init() {

  ZTP20Inst.p.init(
    'MY TOKEN',
    'myTKN',
    'My Token'
  );

  Utils.assert(implementsInterface(ZTP20Inst, IZTP20), 'ZTP20 class does not implement IZTP20');
  Utils.assert(implementsInterface(ZTP20Inst, IZTP20Metadata), 'ZTP20 class does not implement IZTP20Metadata');
  Utils.assert(implementsInterface(ZTP20Inst, IZEP165), 'ZTP20 class does not implement IZEP165');
  return true;
}

function main(input_str) {
  let funcList = {
    'transfer': ZTP20Inst.transfer,
    'approve': ZTP20Inst.approve,
    'transferFrom': ZTP20Inst.transferFrom,
    'mint': mint,
    'burn': burn
  };
  let inputObj = JSON.parse(input_str);
  Utils.assert(funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function', 'Cannot find func:' + inputObj.method);
  funcList[inputObj.method](inputObj.params);
}

function query(input_str) {  
  let funcList = {
    'totalSupply': { key: 'totalSupply', func: ZTP20Inst.totalSupply },
    'balanceOf': { key: 'balance', func: ZTP20Inst.balanceOf },
    'allowance': { key: 'allowance', func: ZTP20Inst.allowance },
    'contractInfo': { key: 'contractInfo', func: ZTP20Inst.contractInfo },
    'name': { key: 'name', func: ZTP20Inst.name },
    'symbol': { key: 'symbol', func: ZTP20Inst.symbol },
    'decimals': { key: 'decimals', func: ZTP20Inst.decimals },
    'supportsInterface': { key: 'supportsInterface', func: ZTP20Inst.supportsInterface }
  };
  let inputObj = JSON.parse(input_str);
  Utils.assert(funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method].func === 'function','Cannot find func: ' + inputObj.method);

  let response = {};
  response[funcList[inputObj.method].key] = funcList[inputObj.method].func(inputObj.params);

  return JSON.stringify(response);
}