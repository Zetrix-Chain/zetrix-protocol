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

const IZTP1155 = {
  balanceOf: function() {
    return this;
  },
  balanceOfBatch: function() {
    return this;
  },
  setApprovalForAll: function() {
    return this;
  },
  isApprovedForAll: function() {
    return this;
  },
  safeTransferFrom: function() {
    return this;
  },
  safeBatchTransferFrom: function() {
    return this;
  }
};

const IZTP1155MetadataURI = {
  uri: function() {
    return this;
  }
};

/**
 * SPDX-License-Identifier: MIT
 * Reference : https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol
 */

const ZTP1155 = function() {

  const BasicOperationUtil = new BasicOperation();

  const BALANCES_PRE = 'balances';
  const OPERATOR_APPROVAL_PRE = 'operator_approval';
  const CONTRACT_INFO = 'contract_info';
  const URI_PRE = 'uri';
  const ZTP_PROTOCOL = 'ztp1155';
  const EMPTY_ADDRESS = '0x';

  const self = this;

  self.p = {
    /*protected function*/ };

  self.supportsInterface = function(paramObj) {
    let interfaceId = paramObj.interfaceId;
    let iface1 = Utils.sha256(JSON.stringify(IZEP165), 1);
    let iface2 = Utils.sha256(JSON.stringify(IZTP1155), 1);
    let iface3 = Utils.sha256(JSON.stringify(IZTP1155MetadataURI), 1);
    return interfaceId === iface1 || interfaceId === iface2 || interfaceId === iface3;
  };

  self.p.setURI = function(uri) {
    BasicOperationUtil.saveObj(URI_PRE, uri);
  };

  self.contractInfo = function() {
    return BasicOperationUtil.loadObj(CONTRACT_INFO);
  };

  self.p.init = function(uri, name, symbol, describe = '', version = '1.0.0') {
    self.p.setURI(uri);
    BasicOperationUtil.saveObj(CONTRACT_INFO, {
      name: name,
      symbol: symbol,
      describe: describe,
      protocol: ZTP_PROTOCOL,
      version: version,
      issuer: Chain.msg.sender
    });
  };

  /**
   * @dev See {IERC1155MetadataURI-uri}.
   *
   * This implementation returns the same URI for *all* token types. It relies
   * on the token type ID substitution mechanism
   * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the ERC].
   *
   * Clients calling this function must replace the `\{id\}` substring with the
   * actual token type ID.
   */
  self.uri = function(paramObj) {
    let _uri = BasicOperationUtil.loadObj(URI_PRE);
    return _uri.length > 0 ? _uri + paramObj.id : '';
  };

  self.balanceOf = function(paramObj) {
    let balance = BasicOperationUtil.loadObj(BasicOperationUtil.getKey(BALANCES_PRE, paramObj.id, paramObj.account));
    if (balance === false) {
      return '0';
    }
    return balance;
  };

  self.balanceOfBatch = function(paramObj) {
    Utils.assert(paramObj.accounts.length === paramObj.ids.length, 'Invalid array length');

    let batchBalances = [];
    let i;
    for (i = 0; i < paramObj.accounts.length; i += 1) {
      batchBalances.push(self.balanceOf({
        id: paramObj.ids[i],
        account: paramObj.accounts[i]
      }));
    }
    return batchBalances;
  };

  /**
   * @dev Approve `operator` to operate on all of `owner` tokens
   *
   * Emits an {ApprovalForAll} event.
   *
   * Requirements:
   *
   * - `operator` cannot be the zero address.
   */
  self.p.setApprovalForAll = function(owner, operator, approved) {
    Utils.assert(Utils.addressCheck(operator), 'ERC1155: Invalid operator');
    BasicOperationUtil.saveObj(BasicOperationUtil.getKey(OPERATOR_APPROVAL_PRE, owner, operator), approved);
    Chain.tlog('ApprovalForAll', owner, operator, approved);
  };

  self.setApprovalForAll = function(paramObj) {
    self.p.setApprovalForAll(Chain.msg.sender, paramObj.operator, paramObj.approved);
  };

  self.isApprovedForAll = function(paramObj) {
    return BasicOperationUtil.loadObj(BasicOperationUtil.getKey(OPERATOR_APPROVAL_PRE, paramObj.owner, paramObj.operator));
  };

  /**
   * @dev Transfers a `value` amount of tokens of type `id` from `from` to `to`. Will mint (or burn) if `from`
   * (or `to`) is the zero address.
   *
   * Emits a {TransferSingle} event if the arrays contain one element, and {TransferBatch} otherwise.
   *
   * Requirements:
   *
   * - If `to` refers to a smart contract, it must implement either {IERC1155Receiver-onERC1155Received}
   *   or {IERC1155Receiver-onERC1155BatchReceived} and return the acceptance magic value.
   * - `ids` and `values` must have the same length.
   *
   * NOTE: The ERC-1155 acceptance check is not performed in this function. See {_updateWithAcceptanceCheck} instead.
   */
  self.p.update = function(from, to, ids, values) {
    Utils.assert(ids.length === values.length, 'ERC1155: Invalid array length');

    let operator = Chain.msg.sender;

    let i;
    for (i = 0; i < ids.length; i += 1) {
      let id = ids[i];
      let value = values[i];
      if (Utils.addressCheck(from)) {
        let fromBalance = self.balanceOf({
          id: id,
          account: from
        });
        Utils.assert(Utils.int256Compare(fromBalance, value) >= 0, 'Insufficient balance');
        BasicOperationUtil.saveObj(BasicOperationUtil.getKey(BALANCES_PRE, id, from), Utils.int256Sub(fromBalance, value));
      }
      if (Utils.addressCheck(to)) {
        let toBalance = self.balanceOf({
          id: id,
          account: to
        });
        BasicOperationUtil.saveObj(BasicOperationUtil.getKey(BALANCES_PRE, id, to), Utils.int256Add(toBalance, value));
      }
    }

    if (ids.length === 1) {
      let _id = ids[0];
      let _val = values[0];
      Chain.tlog('TransferSingle', operator, from, to, _id, _val);
    } else {
      Chain.tlog('TransferBatch', operator, from, to, ids.toString(), values.toString());
    }
  };

  /**
   * @dev Version of {_update} that performs the token acceptance check by calling
   * {IERC1155Receiver-onERC1155Received} or {IERC1155Receiver-onERC1155BatchReceived} on the receiver address if it
   * contains code (eg. is a smart contract at the moment of execution).
   *
   * IMPORTANT: Overriding this function is discouraged because it poses a reentrancy risk from the receiver. So any
   * update to the contract state after this function would break the check-effect-interaction pattern. Consider
   * overriding {_update} instead.
   */
  const _updateWithAcceptanceCheck = function(from, to, ids, values, data = '') {
    self.p.update(from, to, ids, values);
    // if (Utils.addressCheck(to)) {
    //     let operator = Chain.msg.sender;
    //     if (ids.length === 1) {
    //         let id = ids[0];
    //         let value = values[0];
    //         // call checkOnERC1144Received(operator, from, to, id, value, data);
    //     } else {
    //         // call checkOnERC1155BatchReceived(operator, from, to, ids, values, data);
    //     }
    // }
  };

  /**
   * @dev Transfers a `value` tokens of token type `id` from `from` to `to`.
   *
   * Emits a {TransferSingle} event.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - `from` must have a balance of tokens of type `id` of at least `value` amount.
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
   * acceptance magic value.
   */
  const _safeTransferFrom = function(from, to, id, value, data = '') {
    Utils.assert(Utils.addressCheck(to), 'ERC1155: Invalid receiver');
    Utils.assert(Utils.addressCheck(from), 'ERC1155: Invalid sender');
    _updateWithAcceptanceCheck(from, to, [id], [value], data);
  };

  /**
   * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_safeTransferFrom}.
   *
   * Emits a {TransferBatch} event.
   *
   * Requirements:
   *
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
   * acceptance magic value.
   * - `ids` and `values` must have the same length.
   */
  const _safeBatchTransferFrom = function(from, to, ids, values, data = '') {
    Utils.assert(Utils.addressCheck(to), 'ERC1155: Invalid receiver');
    Utils.assert(Utils.addressCheck(from), 'ERC1155: Invalid sender');
    _updateWithAcceptanceCheck(from, to, ids, values, data);
  };

  self.safeTransferFrom = function(paramObj) {
    let sender = Chain.msg.sender;
    Utils.assert(paramObj.from === sender || self.isApprovedForAll({
      account: paramObj.from,
      operator: sender
    }), 'ERC1155: Missing approval for all');
    _safeTransferFrom(paramObj.from, paramObj.to, paramObj.id, paramObj.value, paramObj.data);
  };

  self.safeBatchTransferFrom = function(paramObj) {
    let sender = Chain.msg.sender;
    Utils.assert(paramObj.from === sender || self.isApprovedForAll({
      account: paramObj.from,
      operator: sender
    }), 'ERC1155: Missing approval for all');
    _safeBatchTransferFrom(paramObj.from, paramObj.to, paramObj.ids, paramObj.values, paramObj.data);
  };

  /**
   * @dev Creates a `value` amount of tokens of type `id`, and assigns them to `to`.
   *
   * Emits a {TransferSingle} event.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
   * acceptance magic value.
   */
  self.p.mint = function(to, id, value, data = '') {
    Utils.assert(Utils.addressCheck(to), 'ERC1155: Invalid receiver');
    _updateWithAcceptanceCheck(EMPTY_ADDRESS, to, [id], [value], data);
  };

  /**
   * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
   *
   * Emits a {TransferBatch} event.
   *
   * Requirements:
   *
   * - `ids` and `values` must have the same length.
   * - `to` cannot be the zero address.
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
   * acceptance magic value.
   */
  self.p.mintBatch = function(to, ids, values, data = '') {
    Utils.assert(Utils.addressCheck(to), 'ERC1155: Invalid receiver');
    _updateWithAcceptanceCheck(EMPTY_ADDRESS, to, ids, values, data);
  };

  /**
   * @dev Destroys a `value` amount of tokens of type `id` from `from`
   *
   * Emits a {TransferSingle} event.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `from` must have at least `value` amount of tokens of type `id`.
   */
  self.p.burn = function(from, id, value, data = '') {
    Utils.assert(Utils.addressCheck(from), 'ERC1155: Invalid sender');
    _updateWithAcceptanceCheck(from, EMPTY_ADDRESS, [id], [value], data);
  };

  /**
   * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.
   *
   * Emits a {TransferBatch} event.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `from` must have at least `value` amount of tokens of type `id`.
   * - `ids` and `values` must have the same length.
   */
  self.p.burnBatch = function(from, ids, values, data = '') {
    Utils.assert(Utils.addressCheck(from), 'ERC1155: Invalid sender');
    _updateWithAcceptanceCheck(from, EMPTY_ADDRESS, ids, values, data);
  };

};

const ZTP1155Inst = new ZTP1155();

function mint(paramObj) {
  ZTP1155Inst.p.mint(paramObj.to, paramObj.id, paramObj.value);
}

function mintBatch(paramObj) {
  ZTP1155Inst.p.mintBatch(paramObj.to, paramObj.ids, paramObj.values);
}

function burn(paramObj) {
  ZTP1155Inst.p.burn(paramObj.from, paramObj.id, paramObj.value);
}

function burnBatch(paramObj) {
  ZTP1155Inst.p.burnBatch(paramObj.from, paramObj.ids, paramObj.values);
}

function init() {

  ZTP1155Inst.p.init(
    'https://example.com/',
    'MY 1155',
    'my1155',
    'My 1155 Token'
  );

  Utils.assert(implementsInterface(ZTP1155Inst, IZTP1155), 'ZTP1155 class does not implement IZTP1155');
  Utils.assert(implementsInterface(ZTP1155Inst, IZTP1155MetadataURI), 'ZTP1155 class does not implement IZTP1155MetadataURI');
  Utils.assert(implementsInterface(ZTP1155Inst, IZEP165), 'ZTP1155 class does not implement IZEP165');
  return true;
}

function main(input_str) {
  let funcList = {
    'setApprovalForAll': ZTP1155Inst.setApprovalForAll,
    'safeTransferFrom': ZTP1155Inst.safeTransferFrom,
    'safeBatchTransferFrom': ZTP1155Inst.safeBatchTransferFrom,
    'mint': mint,
    'mintBatch': mintBatch,
    'burn': burn,
    'burnBatch': burnBatch
  };
  let inputObj = JSON.parse(input_str);
  Utils.assert(funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function', 'Cannot find func:' + inputObj.method);
  funcList[inputObj.method](inputObj.params);
}

function query(input_str) {
  let funcList = {
    'balanceOf': {
      key: 'balance',
      func: ZTP1155Inst.balanceOf
    },
    'uri': {
      key: 'uri',
      func: ZTP1155Inst.uri
    },
    'balanceOfBatch': {
      key: 'balances',
      func: ZTP1155Inst.balanceOfBatch
    },
    'isApprovedForAll': {
      key: 'isApprovedForAll',
      func: ZTP1155Inst.isApprovedForAll
    },
    'contractInfo': {
      key: 'contractInfo',
      func: ZTP1155Inst.contractInfo
    },
    'supportsInterface': {
      key: 'supportsInterface',
      func: ZTP1155Inst.supportsInterface
    }
  };
  let inputObj = JSON.parse(input_str);
  Utils.assert(funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method].func === 'function', 'Cannot find func: ' + inputObj.method);

  let response = {};
  response[funcList[inputObj.method].key] = funcList[inputObj.method].func(inputObj.params);

  return JSON.stringify(response);
}