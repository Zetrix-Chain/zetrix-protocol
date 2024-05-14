'use strict';

const CONTRACT_PRE = 'contract_info';
const FIXED_DECIMALS = '6';
const PROTOCOL = 'ztp20';

function makeAllowanceKey(owner, spender) {
  return 'allow_' + owner + '_to_' + spender;
}

function approve(spender, value) {
  Utils.assert(Utils.addressCheck(spender) === true, 'Arg-spender is not a valid address.');
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, '0') >= 0, 'Arg-value of spender ' + spender + ' must greater or equal to 0.');

  let key = makeAllowanceKey(Chain.msg.sender, spender);
  Chain.store(key, value);

  Chain.tlog('Approve', Chain.msg.sender, spender, value);

  return true;
}

function allowance(owner, spender) {
  Utils.assert(Utils.addressCheck(owner) === true, 'Arg-owner is not a valid address.');
  Utils.assert(Utils.addressCheck(spender) === true, 'Arg-spender is not a valid address.');

  let key = makeAllowanceKey(owner, spender);
  let value = Chain.load(key);
  Utils.assert(value !== false, 'Failed to get the allowance given to ' + spender + ' by ' + owner + ' from metadata.');

  return value;
}

function transfer(to, value) {
  Utils.assert(Utils.addressCheck(to) === true, 'Arg-to is not a valid address.');
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, '0') > 0, 'Arg-value must be greater than 0.');
  Utils.assert(Chain.msg.sender !== to, 'From cannot equal to address.');

  let senderValue = Chain.load(Chain.msg.sender);
  Utils.assert(senderValue !== false, 'Failed to get the balance of ' + Chain.msg.sender + ' from metadata.');
  Utils.assert(Utils.int64Compare(senderValue, value) >= 0, 'Balance:' + senderValue + ' of sender:' + Chain.msg.sender + ' < transfer value:' + value + '.');

  let toValue = Chain.load(to);
  toValue = (toValue === false) ? value: Utils.int64Add(toValue, value);
  Chain.store(to, toValue);

  senderValue = Utils.int64Sub(senderValue, value);
  Chain.store(Chain.msg.sender, senderValue);

  Chain.tlog('Transfer', Chain.msg.sender, to, value);

  return true;
}

function transferFrom(from, to, value) {
  Utils.assert(Utils.addressCheck(from) === true, 'Arg-from is not a valid address.');
  Utils.assert(Utils.addressCheck(to) === true, 'Arg-to is not a valid address.');
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, '0') > 0, 'Arg-value must be greater than 0.');
  Utils.assert(from !== to, 'From cannot equal to address.');

  let fromValue = Chain.load(from);
  Utils.assert(fromValue !== false, 'Failed to get the value, probably because ' + from + ' has no value.');
  Utils.assert(Utils.int64Compare(fromValue, value) >= 0, from + ' Balance:' + fromValue + ' < transfer value:' + value + '.');

  let allowValue = allowance(from, Chain.msg.sender);
  Utils.assert(Utils.int64Compare(allowValue, value) >= 0, 'Allowance value:' + allowValue + ' < transfer value:' + value + ' from ' + from + ' to ' + to + '.');

  let toValue = Chain.load(to);
  toValue = (toValue === false) ? value: Utils.int64Add(toValue, value);
  Chain.store(to, toValue);

  fromValue = Utils.int64Sub(fromValue, value);
  Chain.store(from, fromValue);

  let allowKey = makeAllowanceKey(from, Chain.msg.sender);
  allowValue = Utils.int64Sub(allowValue, value);
  Chain.store(allowKey, allowValue);

  Chain.tlog('Transfer', from, to, value);

  return true;
}

function deposit(value) {
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, Chain.msg.coinAmount) === 0, 'Arg-value must equal pay coin amount.');
  Utils.assert(Utils.int64Compare(value, "0") > 0, 'Arg-value must > 0.');
  let senderValue = Chain.load(Chain.msg.sender);
  senderValue = (senderValue === false) ? value: Utils.int64Add(senderValue, value);
  Chain.store(Chain.msg.sender, senderValue);
  Chain.tlog('Deposit', Chain.msg.sender, value);
  Chain.tlog('Transfer', "0x", Chain.msg.sender, value);
  return true;
}

function withdrawal(value) {
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(Chain.msg.coinAmount, "0") === 0, 'Pay coin amount must be 0.');
  Utils.assert(Utils.int64Compare(value, "0") > 0, 'Arg-value must > 0.');
  let senderValue = Chain.load(Chain.msg.sender);
  Utils.assert(senderValue !== false, 'Failed to get the balance of ' + Chain.msg.sender + ' from metadata.');
  Utils.assert(Utils.int64Compare(senderValue, value) >= 0, 'Balance:' + senderValue + ' of sender:' + Chain.msg.sender + ' < transfer value:' + value + '.');

  senderValue = Utils.int64Sub(senderValue, value);
  Chain.store(Chain.msg.sender, senderValue);

  Chain.tlog('Withdrawal', Chain.msg.sender, value);
  Chain.tlog('Transfer', Chain.msg.sender, "0x", value);

  Chain.payCoin(Chain.msg.sender, value);
  return true;
}

function balanceOf(address) {
  Utils.assert(Utils.addressCheck(address) === true, 'Arg-address is not a valid address.');

  let value = Chain.load(address);
  return value === false ? "0": value;
}

function init(input_str) {
  //Utils.assert(Utils.int64Compare(Chain.msg.coinAmount, "0") === 0, 'Paycoin amount must be 0.');
  let paramObj = JSON.parse(input_str).params;
  Utils.assert(paramObj.name !== undefined && paramObj.name.length > 0, 'Param obj has no name.');
  Utils.assert(paramObj.symbol !== undefined && paramObj.symbol.length > 0, 'Param obj has no symbol.');
  Utils.assert(paramObj.describe !== undefined && paramObj.describe.length > 0, 'Param obj has no describe.');
  Utils.assert(paramObj.version !== undefined && paramObj.version.length > 0, 'Param obj has no version.');

  paramObj.decimals = FIXED_DECIMALS;
  paramObj.protocol = PROTOCOL;
  Chain.store(CONTRACT_PRE, JSON.stringify(paramObj));
}

function main(input_str) {
  let input = JSON.parse(input_str);

  if (input.method === 'transfer') {
    transfer(input.params.to, input.params.value);
  } else if (input.method === 'transferFrom') {
    transferFrom(input.params.from, input.params.to, input.params.value);
  } else if (input.method === 'approve') {
    approve(input.params.spender, input.params.value);
  } else if (input.method === 'deposit') {
    deposit(input.params.value);
  } else if (input.method === 'withdrawal') {
    withdrawal(input.params.value);
  } else {
    throw '
';
  }
}

function query(input_str) {
  let result = {};
  let input = JSON.parse(input_str);

  if (input.method === 'contractInfo') {
    result = JSON.parse(Chain.load(CONTRACT_PRE));
    result.supply = Chain.getBalance(Chain.thisAddress);
  } else if (input.method === 'allowance') {
    result.allowance = allowance(input.params.owner, input.params.spender);
  } else if (input.method === 'balanceOf') {
    result.balance = balanceOf(input.params.address);
  } else {
    throw '';
  }
  return JSON.stringify(result);
}

