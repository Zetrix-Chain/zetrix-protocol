'use strict';

const ASSET_PRE = 'asset';
const BALANCE_PRE = 'balance';
const APPROVE_PRE = 'approve';
const CONTRACT_PRE = 'contract_info';
const ZTP_PROTOCOL = 'ztp1155';

function _isHexStr64(str) {
  let a = /^[A-Fa-f0-9]{64,64}$/;
  return a.test(str);
}

function getKey(first, second, third = '') {
  return (third === '') ? (first + '_' + second) : (first + '_' + second + '_' + third);
}

function _isCreator(address, ID) {
  return ID.substr(0, 32) === Utils.sha256(address, 1).substr(0, 32);
}

function _maxSupply(ID) {
  let result = Utils.hexToDec(ID.substr(48, 16));
  Utils.assert(result !== false, 'Hex to dec error:' + ID.substr(48, 16));
  Utils.assert(Utils.stoI64Check(result) === true, 'Hex to dec, check int64 error:' + ID.substr(48, 16));
  return Utils.int64Add(result, "0");
}

function loadObj(key) {
  let data = Chain.load(key);
  Utils.assert(data !== false, 'Failed to get storage data, key:' + key);
  return JSON.parse(data);
}

function saveObj(key, value) {
  Chain.store(key, JSON.stringify(value));
}

function getBalance(id, owner) {
  let data = Chain.load(getKey(BALANCE_PRE, id, owner));
  if (data === false) {
    return "0";
  }

  return JSON.parse(data).value;
}

function saveBalance(id, owner, value) {
  let result = Utils.int64Compare(value, "0");
  Utils.assert(value >= 0, 'Value must gt or equal 0.');
  if (result === 0) {
    Chain.del(getKey(BALANCE_PRE, id, owner));
    return;
  }

  let balanceObj = {};
  balanceObj.value = value;
  saveObj(getKey(BALANCE_PRE, id, owner), balanceObj);
}

function getApproved(owner, operator) {
  let data = Chain.load(getKey(APPROVE_PRE, owner, operator));
  if (data === false) {
    return false;
  }

  return JSON.parse(data).approved;
}

function saveApproved(owner, operator, approved) {
  let approvedObj = {};
  approvedObj.approved = approved;
  saveObj(getKey(APPROVE_PRE, owner, operator), approvedObj);
}

function saveAsset(id, issuer, uri, value, freezed) {
  let nftObj = {};
  nftObj.id = id;
  nftObj.issuer = issuer;
  nftObj.uri = uri;
  nftObj.value = value;
  nftObj.freezed = freezed;
  saveObj(getKey(ASSET_PRE, id), nftObj);
}

function getAsset(id) {
  return loadObj(getKey(ASSET_PRE, id));
}

function checkAssetExsit(id) {
  let data = Chain.load(getKey(ASSET_PRE, id));
  if (data === false) {
    return false;
  }

  return true;
}

function _mint(id, to, uri, value) {
  Utils.assert(_isHexStr64(id) === true, 'Id must be 64 length hex str.');
  Utils.assert(Utils.stoI64Check(value) === true, 'Param value error.');
  Utils.assert(Utils.int64Compare(value, 0) > 0, 'Param value error.');
  Utils.assert(uri !== undefined && uri.length > 0, 'Param obj has no uri.');
  Utils.assert(checkAssetExsit(id) === false, 'Check nft already exist.');
  Utils.assert(_isCreator(to, id) === true, 'Not creator.');
  Utils.assert(Utils.int64Compare(_maxSupply(id), value) === 0, 'Id supply must equal value.');

  saveAsset(id, to, uri, value, false);
  saveBalance(id, to, value);
}

function _transFrom(id, from, to, value, data) {
  //If it doesn't exist, make lazy casting
  if (checkAssetExsit(id) === false) {
    Utils.assert(data !== undefined && data.length > 0, 'Need to mint, but param obj has no data(uri).');
    Utils.assert(Utils.int64Compare(_maxSupply(id), value) >= 0, 'Id supply must larger than value.');
    _mint(id, from, data, _maxSupply(id));
  }

  //Check if your assets are owned or approved
  Utils.assert(_isHexStr64(id) === true, 'Id must be 64 length hex str.');
  Utils.assert(checkAssetExsit(id) === true, 'Check nft not exist.');
  let approved = getApproved(from, Chain.msg.sender);
  Utils.assert(Chain.msg.sender === from || approved === true, 'No privilege to trans.');
  let rawFromValue = getBalance(id, from);
  let rawToValue = getBalance(id, to);
  Utils.assert(Utils.int64Compare(rawFromValue, value) >= 0, 'Balance:' + rawFromValue + ' of sender:' + Chain.msg.sender + ' < transfer value:' + value + '.');

  let fromValue = Utils.int64Sub(rawFromValue, value);
  let toValue = Utils.int64Add(rawToValue, value);
  //Check if your assets are owned or approved
  saveBalance(id, to, toValue);
  saveBalance(id, from, fromValue);

  //TODOO triggers contract execution if it is a contract
}

function safeTransferFrom(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.from !== undefined && paramObj.from.length > 0, 'Param obj has no from.');
  Utils.assert(paramObj.to !== undefined && paramObj.to.length > 0, 'Param obj has no to.');
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id.');
  Utils.assert(paramObj.value !== undefined && paramObj.value.length > 0, 'Param obj has no value.');
  Utils.assert(paramObj.data !== undefined && paramObj.data.length >= 0, 'Param obj has no data.');
  Utils.assert(Utils.addressCheck(paramObj.from), 'From address is invalid.');
  Utils.assert(Utils.addressCheck(paramObj.to), 'To address is invalid.');
  Utils.assert(paramObj.from !== paramObj.to, 'From cannot equal to address.');
  Utils.assert(Utils.int64Compare(paramObj.value, 0) > 0, 'Value must greater than 0.');

  _transFrom(paramObj.id, paramObj.from, paramObj.to, paramObj.value, paramObj.data);

  //trigger event
  Chain.tlog('TransferSingle', Chain.msg.sender, paramObj.from, paramObj.to, paramObj.id, paramObj.value);
}

function safeBatchTransferFrom(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.from !== undefined && paramObj.from.length > 0, 'Param obj has no from.');
  Utils.assert(paramObj.to !== undefined && paramObj.to.length > 0, 'Param obj has no to.');
  Utils.assert(paramObj.ids !== undefined && paramObj.ids.length > 0, 'Param obj has no ids.');
  Utils.assert(paramObj.values !== undefined && paramObj.values.length > 0, 'Param obj has no values.');
  Utils.assert(paramObj.datas !== undefined && paramObj.datas.length > 0, 'Param obj has no datas.');
  Utils.assert(Utils.addressCheck(paramObj.from), 'From address is invalid.');
  Utils.assert(Utils.addressCheck(paramObj.to), 'To address is invalid.');
  Utils.assert(paramObj.from !== paramObj.to, 'From cannot equal to address.');
  Utils.assert(paramObj.ids.length === paramObj.values.length, 'Ids not equal values with length.');
  Utils.assert(paramObj.ids.length === paramObj.datas.length, 'Ids not equal data with length.');
  Utils.assert(paramObj.values.length === paramObj.datas.length, 'Values not equal data with length.');

  //Transfer assets and keep records
  let i = 0;
  for (i = 0; i < paramObj.ids.length; i += 1) {
    Utils.assert(Utils.int64Compare(paramObj.values[i], 0) > 0, 'Value must greater than 0.');
    _transFrom(paramObj.ids[i], paramObj.from, paramObj.to, paramObj.values[i], paramObj.datas[i]);
  }

  //trigger event
  Chain.tlog('TransferBatch', Chain.msg.sender, paramObj.from, paramObj.to, JSON.stringify(paramObj.ids), JSON.stringify(paramObj.values));
}

function setApprovalForAll(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.operator !== undefined && paramObj.operator.length > 0, 'Param obj has no operator.');
  Utils.assert(paramObj.approved !== undefined, 'Param obj has no approved.');
  Utils.assert(paramObj.approved === true || paramObj.approved === false, 'Approved must be true or false.');
  Utils.assert(Utils.addressCheck(paramObj.operator), 'Operator address is invalid.');
  Utils.assert(Chain.msg.sender !== paramObj.operator, 'Operator cannot equal msg sender.');

  //state of preservation
  saveApproved(Chain.msg.sender, paramObj.operator, paramObj.approved);

  //Trigger log
  Chain.tlog('ApprovalForAll', Chain.msg.sender, paramObj.operator, paramObj.approved);
}

function setURI(paramObj) {
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id.');
  Utils.assert(_isHexStr64(paramObj.id) === true, 'Id must be 64 length hex str.');
  Utils.assert(checkAssetExsit(paramObj.id) === true, 'Check nft not exist.');
  Utils.assert(_isCreator(Chain.msg.sender, paramObj.id) === true, 'Not creator.');
  Utils.assert(paramObj.uri !== undefined && paramObj.uri.length > 0, 'Param obj has no uri.');
  Utils.assert(paramObj.uri.trim() !== "", "Param obj uri is empty.");
  Utils.assert(paramObj.freezed !== undefined && (paramObj.freezed === true || paramObj.freezed === false), 'Param obj freezed error.');
  let asset = getAsset(paramObj.id);
  Utils.assert(asset.freezed === false, 'Nft uri is freezed.');
  Utils.assert(Utils.int64Compare(getBalance(paramObj.id, Chain.msg.sender), getAsset(paramObj.id).value) === 0, 'Must be hold all assets.');

  saveAsset(asset.id, asset.issuer, paramObj.uri, asset.value, paramObj.freezed);
  Chain.tlog('URI', paramObj.uri, paramObj.id);
  if (paramObj.freezed === true) {
    Chain.tlog('Freezed', paramObj.uri, paramObj.id);
  }

  return;
}

function mint(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.to !== undefined && paramObj.to.length > 0, 'Param obj has no to.');
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id.');
  Utils.assert(paramObj.value !== undefined && paramObj.value.length > 0, 'Param obj has no value.');
  Utils.assert(paramObj.uri !== undefined && paramObj.uri.length > 0, 'Param obj has no uri.');
  Utils.assert(Utils.addressCheck(paramObj.to), 'To address is invalid.');

  //Issue additional assets and keep records
  _mint(paramObj.id, paramObj.to, paramObj.uri, paramObj.value);

  //trigger event
  Chain.tlog('TransferSingle', Chain.msg.sender, '0x', paramObj.to, paramObj.id, paramObj.value);
}

function _burn(id, from, value) {
  Utils.assert(_isHexStr64(id) === true, 'Id must be 64 length hex str.');
  Utils.assert(checkAssetExsit(id) === true, 'Check nft not exist.');
  Utils.assert(Utils.int64Compare(value, 0) > 0, 'Value must greater than 0.');
  //Check whether you approve or own assets
  let approved = getApproved(from, Chain.msg.sender);
  Utils.assert(Chain.msg.sender === from || approved === true, 'No privilege to trans.');
  let rawFromValue = getBalance(id, from);
  Utils.assert(Utils.int64Compare(rawFromValue, value) >= 0, 'Balance:' + rawFromValue + ' of sender:' + Chain.msg.sender + ' < transfer value:' + value + '.');

  let fromValue = Utils.int64Sub(rawFromValue, value);
  //Transfer assets and keep records
  saveBalance(id, from, fromValue);
}

function burn(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.from !== undefined && paramObj.from.length > 0, 'Param obj has no from.');
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id.');
  Utils.assert(paramObj.value !== undefined && paramObj.value.length > 0, 'Param obj has no value.');
  Utils.assert(Utils.addressCheck(paramObj.from), 'From address is invalid.');

  //Destruction of assets
  _burn(paramObj.id, paramObj.from, paramObj.value);

  //trigger event
  Chain.tlog('TransferSingle', Chain.msg.sender, paramObj.from, '0x', paramObj.id, paramObj.value);
}

function balanceOf(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.owner !== undefined && paramObj.owner.length > 0, 'Param obj has no owner');
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id');

  let result = {};
  result.balance = getBalance(paramObj.id, paramObj.owner);
  return result;
}

function balanceOfBatch(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.owners !== undefined && paramObj.owners.length > 0, 'Param obj has no owners.');
  Utils.assert(paramObj.ids !== undefined && paramObj.ids.length > 0, 'Param obj has no ids.');
  Utils.assert(paramObj.ids.length === paramObj.owners.length, 'Ids not equal owners with length.');

  let result = {};
  result.balances = [];
  let i = 0;
  for (i = 0; i < paramObj.ids.length; i += 1) {
    result.balances.push(getBalance(paramObj.ids[i], paramObj.owners[i]));
  }

  return result;
}

function isApprovedForAll(paramObj) {
  //Checking parameter Validity
  Utils.assert(paramObj.owner !== undefined && paramObj.owner.length > 0, 'Param obj has no owner.');
  Utils.assert(paramObj.operator !== undefined && paramObj.operator.length > 0, 'Param obj has no operator.');

  let approvedObj = {};
  approvedObj.approved = getApproved(paramObj.owner, paramObj.operator);
  return approvedObj;
}

function contractInfo() {
  return loadObj(CONTRACT_PRE);
}

function uri(paramObj) {
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id.');
  let uriObj = {};
  uriObj.uri = getAsset(paramObj.id).uri;
  return uriObj;
}

function freezed(paramObj) {
  Utils.assert(paramObj.id !== undefined && paramObj.id.length > 0, 'Param obj has no id.');
  let freezedObj = {};
  freezedObj.freezed = getAsset(paramObj.id).freezed;
  return freezedObj;
}

function init(input_str) {
  let paramObj = JSON.parse(input_str).params;
  Utils.assert(paramObj.name !== undefined && paramObj.name.length > 0, 'Param obj has no name.');
  Utils.assert(paramObj.symbol !== undefined && paramObj.symbol.length > 0, 'Param obj has no symbol.');
  Utils.assert(paramObj.describe !== undefined && paramObj.describe.length > 0, 'Param obj has no describe.');
  Utils.assert(paramObj.protocol !== undefined && paramObj.protocol.length > 0 && paramObj.protocol.toLowerCase() === ZTP_PROTOCOL, 'Param obj protocol must be ztp1155.');
  Utils.assert(paramObj.version !== undefined && paramObj.version.length > 0, 'Param obj has no version.');
  Utils.assert(paramObj.url !== undefined && paramObj.url.length > 0, 'Param obj has no url.');

  saveObj(CONTRACT_PRE, paramObj);
  return;
}

function main(input_str) {
  let funcList = {
    'safeTransferFrom': safeTransferFrom,
    'safeBatchTransferFrom': safeBatchTransferFrom,
    'setApprovalForAll': setApprovalForAll,
    'setURI': setURI,
    'mint': mint,
    'burn': burn
  };
  let inputObj = JSON.parse(input_str);
  Utils.assert(funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function', 'Cannot find func:' + inputObj.method);
  funcList[inputObj.method](inputObj.params);
}

function query(input_str) {
  let funcList = {
    'balanceOf': balanceOf,
    'balanceOfBatch': balanceOfBatch,
    'isApprovedForAll': isApprovedForAll,
    'contractInfo': contractInfo,
    'uri': uri,
    'freezed': freezed
  };
  let inputObj = JSON.parse(input_str);
  Utils.assert(funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function', 'Cannot find func:' + inputObj.method);
  return JSON.stringify(funcList[inputObj.method](inputObj.params));
