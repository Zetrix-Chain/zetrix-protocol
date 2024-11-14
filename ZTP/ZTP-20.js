"use strict";
const CONTRACT_PRE = "contract_info";
const ZTP_PROTOCOL = "ztp20";

function makeAllowanceKey(owner, spender) {
    return "allow_" + owner + "_to_" + spender;
}

function approve(spender, value) {
    Utils.assert(Utils.addressCheck(spender) === true, "Arg-spender is not a valid address.");
    Utils.assert(Utils.stoI256Check(value) === true, "Arg-value must be alphanumeric.");
    Utils.assert(Utils.int256Compare(value, "0") >= 0, "Arg-value of spender " + spender + " must greater or equal to 0.");
    let key = makeAllowanceKey(Chain.msg.sender, spender);
    Chain.store(key, value);
    Chain.tlog("Approve", Chain.msg.sender, spender, value);
    return true;
}

function allowance(owner, spender) {
    Utils.assert(Utils.addressCheck(owner) === true, "Arg-owner is not a valid address.");
    Utils.assert(Utils.addressCheck(spender) === true, "Arg-spender is not a valid address.");
    let key = makeAllowanceKey(owner, spender);
    let value = Chain.load(key);
    Utils.assert(value !== false, "Failed to get the allowance given to " + spender + " by " + owner + " from metadata.");
    return value;
}

function transfer(to, value) {
    Utils.assert(Utils.addressCheck(to) === true, "Arg-to is not a valid address.");
    Utils.assert(Utils.stoI256Check(value) === true, "Arg-value must be alphanumeric.");
    Utils.assert(Utils.int256Compare(value, "0") > 0, "Arg-value must be greater than 0.");
    Utils.assert(Chain.msg.sender !== to, "From cannot equal to address.");
    let senderValue = Chain.load(Chain.msg.sender);
    Utils.assert(senderValue !== false, "Failed to get the balance of " + Chain.msg.sender + " from metadata.");
    Utils.assert(Utils.int256Compare(senderValue, value) >= 0, "Balance:" + senderValue + " of sender:" + Chain.msg.sender + " < transfer value:" + value + ".");
    let toValue = Chain.load(to);
    toValue = (toValue === false) ? value : Utils.int256Add(toValue, value);
    Chain.store(to, toValue);
    senderValue = Utils.int256Sub(senderValue, value);
    Chain.store(Chain.msg.sender, senderValue);
    Chain.tlog("Transfer", Chain.msg.sender, to, value);
    return true;
}

function transferFrom(from, to, value) {
    Utils.assert(Utils.addressCheck(from) === true, "Arg-from is not a valid address.");
    Utils.assert(Utils.addressCheck(to) === true, "Arg-to is not a valid address.");
    Utils.assert(Utils.stoI256Check(value) === true, "Arg-value must be alphanumeric.");
    Utils.assert(Utils.int256Compare(value, "0") > 0, "Arg-value must be greater than 0.");
    Utils.assert(from !== to, "From cannot equal to address.");
    let fromValue = Chain.load(from);
    Utils.assert(fromValue !== false, "Failed to get the value, probably because " + from + " has no value.");
    Utils.assert(Utils.int256Compare(fromValue, value) >= 0, from + " Balance:" + fromValue + " < transfer value:" + value + ".");
    let allowValue = allowance(from, Chain.msg.sender);
    Utils.assert(Utils.int256Compare(allowValue, value) >= 0, "Allowance value:" + allowValue + " < transfer value:" + value + " from " + from + " to " + to + ".");
    let toValue = Chain.load(to);
    toValue = (toValue === false) ? value : Utils.int256Add(toValue, value);
    Chain.store(to, toValue);
    fromValue = Utils.int256Sub(fromValue, value);
    Chain.store(from, fromValue);
    let allowKey = makeAllowanceKey(from, Chain.msg.sender);
    allowValue = Utils.int256Sub(allowValue, value);
    Chain.store(allowKey, allowValue);
    Chain.tlog("Transfer", from, to, value);
    return true;
}

function balanceOf(address) {
    Utils.assert(Utils.addressCheck(address) === true, "Arg-address is not a valid address.");
    let value = Chain.load(address);
    return value === false ? "0" : value;
}

function mint(to, value) {
    Utils.assert(to !== undefined && to.length > 0, "Param obj has no to.");
    Utils.assert(Utils.addressCheck(to), "To address is invalid.");
    Utils.assert(Utils.stoI256Check(value) === true, "Arg-value must be alphanumeric.");
    Utils.assert(Utils.int256Compare(value, "0") > 0, "Arg-value must > 0.");
    let contractInfo = JSON.parse(Chain.load(CONTRACT_PRE));
    Utils.assert(contractInfo.issuer === Chain.msg.sender, "Only issuer can mint.");
    let toValue = Chain.load(to);
    toValue = (toValue === false) ? value : Utils.int256Add(toValue, value);
    contractInfo.supply = Utils.int256Add(contractInfo.supply, value);
    Chain.store(to, toValue);
    Chain.store(CONTRACT_PRE, JSON.stringify(contractInfo));
    Chain.tlog("Transfer", "0x", to, value);
}

function burn(value) {
    Utils.assert(Utils.stoI256Check(value) === true, "Arg-value must be alphanumeric.");
    Utils.assert(Utils.int256Compare(value, "0") > 0, "Arg-value must > 0.");
    let contractInfo = JSON.parse(Chain.load(CONTRACT_PRE));
    Utils.assert(contractInfo.issuer === Chain.msg.sender, "Only issuer can burn.");
    let senderValue = Chain.load(Chain.msg.sender);
    Utils.assert(senderValue !== false, "Failed to get the balance of " + Chain.msg.sender + " from metadata.");
    Utils.assert(Utils.int256Compare(senderValue, value) >= 0, "Balance:" + senderValue + " of sender:" + Chain.msg.sender + " < transfer value:" + value + ".");
    contractInfo.supply = Utils.int256Sub(contractInfo.supply, value);
    senderValue = Utils.int256Sub(senderValue, value);
    Chain.store(Chain.msg.sender, senderValue);
    Chain.store(CONTRACT_PRE, JSON.stringify(contractInfo));
    Chain.tlog("Transfer", Chain.msg.sender, "0x", value);
}

function init(input_str) {
    let paramObj = JSON.parse(input_str).params;
    Utils.assert(paramObj.name !== undefined && paramObj.name.length > 0, "Param obj has no name.");
    Utils.assert(paramObj.symbol !== undefined && paramObj.symbol.length > 0, "Param obj has no symbol.");
    Utils.assert(paramObj.describe !== undefined && paramObj.describe.length > 0, "Param obj has no describe.");
    Utils.assert(paramObj.decimals !== undefined && Utils.int256Compare(paramObj.decimals, "0") >= 0, "Param obj decimals error.");
    Utils.assert(paramObj.version !== undefined && paramObj.version.length > 0, "Param obj has no version.");
    Utils.assert(paramObj.supply !== undefined && Utils.int256Compare(paramObj.supply, "0") >= 0, "Param obj supply error.");
    paramObj.protocol = ZTP_PROTOCOL;
    paramObj.issuer = Chain.msg.sender;
    Chain.store(CONTRACT_PRE, JSON.stringify(paramObj));
    Chain.store(Chain.msg.sender, paramObj.supply);
    Chain.tlog("Transfer", "0x", Chain.msg.sender, paramObj.supply);
}

function main(input_str) {
    let input = JSON.parse(input_str);
    if (input.method === "transfer") {
        transfer(input.params.to, input.params.value);
    } else {
        if (input.method === "transferFrom") {
            transferFrom(input.params.from, input.params.to, input.params.value);
        } else {
            if (input.method === "approve") {
                approve(input.params.spender, input.params.value);
            } else {
                if (input.method === "mint") {
                    mint(input.params.to, input.params.value);
                } else {
                    if (input.method === "burn") {
                        burn(input.params.value);
                    } else {
                        throw 'Unknown operating: ' + input.method + '.';
                    }
                }
            }
        }
    }
}

function query(input_str) {
    let result = {};
    let input = JSON.parse(input_str);
    if (input.method === "contractInfo") {
        result = JSON.parse(Chain.load(CONTRACT_PRE));
    } else {
        if (input.method === "allowance") {
            result.allowance = allowance(input.params.owner, input.params.spender);
        } else {
            if (input.method === "balanceOf") {
                result.balance = balanceOf(input.params.address);
            } else {
                throw 'Unknown operating: ' + input.method + '.';
            }
        }
    }
    return JSON.stringify(result);
}