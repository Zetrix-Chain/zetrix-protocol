'use strict';

const SLOT_PRE = 'slot';
const TOKEN_PRE = 'token';
const BALANCE_PRE = 'balance';
const CONTRACT_PRE = 'contract_info';
const TOTAL_SUPPLY = 'total_supply';
const ZTP_PROTOCOL = 'ztp3525';

// key generating function
function getKey(first, second, third = '') {
    return (third === '') ? (first + '_' + second) : (first + '_' + second + '_' + third);
}

// get a list of all the tokens belonging to this contract
function totalSupply() {
    let data = Chain.load(TOTAL_SUPPLY);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + TOTAL_SUPPLY);
    return data === false ? [] : JSON.parse(data);
}

// returns the number of tokens for a given address
function balanceOf(address) {
    let key = getKey(BALANCE_PRE, address);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    return data === false ? 0 : JSON.parse(data).tokens.length;
}

// returns list of tokens owned by the given address
function tokensOfOwner(address) {
    let key = getKey(BALANCE_PRE, address);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    return data === false ? "Could not find address." : JSON.parse(data).tokens;
}

// get the owner of a given token id
function ownerOf(tokenId) {
    let key = getKey(TOKEN_PRE, tokenId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    return data === false ? "Could not find owner." : JSON.parse(data).owner;
}

// returns the slot ID of a given token
function slotOf(tokenId) {
    let key = getKey(TOKEN_PRE, tokenId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    return data === false ? "Could not find token." : JSON.parse(data).slotId;
}

// returns contract information
function contractInfo() {
    let data = Chain.load(CONTRACT_PRE);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + CONTRACT_PRE);
    if (data === false) {
        return false;
    }
    return JSON.parse(data);
}

// return token metadata
function tokenURI(tokenId) {
    let key = getKey(TOKEN_PRE, tokenId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    return data === false ? "Could not find token." : JSON.parse(data);
}


// get the approved operator addresses with the given token id
function getApproved(tokenId) {
    let key = getKey(TOKEN_PRE, tokenId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    return data === false ? "Could not find token." : JSON.parse(data).operators;
}

// function to check whether an operator is approved to manage all tokens owned by the owner
function isApprovedForAll(owner, operator) {
    let key = getKey(BALANCE_PRE, owner);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    data = JSON.parse(data);
    if (data.tokens.length !== 0) {
        let result = data.tokens.every(function(token) {
            let tokenData = Chain.load(getKey(TOKEN_PRE, token.id));
            if (tokenData !== false) {
                tokenData = JSON.parse(tokenData);
                if (tokenData.operator !== operator) {
                    return false; // Stop checking if operator does not match
                }
            }
            return true; // Continue checking
        });
        return result;
    } else {
        return false;
    }
}

// function to check whether an operator is approved to manage the slot owned by the owner
function isApprovedForSlot(slotId, operator) {
    let key = getKey(SLOT_PRE, slotId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    data = JSON.parse(data);
    let result = data.operators.includes(operator);
    return result;
}

// approves an operator to a single token 
function approve(operator, tokenId) {
    Utils.assert(Utils.addressCheck(operator) === true, 'Operator address is invalid.');
    let tokenData = Chain.load(getKey(TOKEN_PRE, tokenId));
    Utils.assert(tokenData !== false, 'Token does not exist.');
    tokenData = JSON.parse(tokenData);
    Utils.assert(Chain.msg.sender === tokenData.owner, 'Only owner of the token is allowed to call this function.');
    tokenData.operators.push(operator);
    Chain.store(getKey(TOKEN_PRE, tokenId), JSON.stringify(tokenData));
}

// approves an operator to a slot
function approveForSlot(operator, slotId) {
    Utils.assert(Utils.addressCheck(operator) === true, 'Operator address is invalid.');
    let slotKey = getKey(SLOT_PRE, slotId);
    let slotData = Chain.load(slotKey);
    Utils.assert(slotData !== false, 'Slot key does not exist: ' + slotKey);
    slotData = JSON.parse(slotData);
    Utils.assert(Chain.msg.sender === slotData.owner, 'Only owner of the slot is allowed to call this function.');
    slotData.operators.push(operator);
    Chain.store(slotKey, JSON.stringify(slotData));
}

// approves an operator to all the tokens owned by the given owner
function approveForAll(owner, operator) {
    Utils.assert(Utils.addressCheck(owner) === true, 'Owner address is invalid.');
    Utils.assert(Utils.addressCheck(operator) === true, 'Operator address is invalid.');
    let balanceData = Chain.load(getKey(BALANCE_PRE, owner));
    Utils.assert(balanceData !== false, `Balance data for address "${owner}" does not exist.`);
    Utils.assert(Chain.msg.sender === owner, 'Only the owner is allowed to call this function.');
    balanceData = JSON.parse(balanceData);
    balanceData.tokens.forEach(function(tokenKey) {
        let tokenData = JSON.parse(Chain.load(tokenKey));
        Utils.assert(tokenData.owner === owner, `Token ID ${tokenKey} is not owned by ${owner}.`);
        tokenData.operators.push(operator);
        Chain.store(tokenKey, JSON.stringify(tokenData));    
    });
}

// return slot metadata
function slotURI(slotId) {
    let key = getKey(SLOT_PRE, slotId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    if (data === false) {
        return false;
    }
    return JSON.parse(data);
}

// return slot metadata
function getSlotMetadata(slotId) {
    let key = getKey(SLOT_PRE, slotId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    if (data === false) {
        return false;
    }
    return JSON.parse(data);
}

// returns list of tokens in the slot
function tokensInSlot(slotId) {
    let key = getKey(SLOT_PRE, slotId);
    let data = Chain.load(key);
    Utils.assert(data !== false, 'Failed to get storage data, key: ' + key);
    if (data === false) {
        return false;
    }
    return JSON.parse(data).tokens;
}

// set slot metadata
function setSlotMetadata(slotId, tokens, operators, owner) {
    Utils.assert(Utils.addressCheck(owner) === true, 'Owner address is invalid.');
    operators.forEach(function(operator) {
        Utils.assert(Utils.addressCheck(operator) === true, `Operator address "${operator}" is invalid.`);
    });

    let slotData = Chain.load(getKey(SLOT_PRE, slotId));
    // slot does not exist yet
    if (slotData === false) {
        let slotObject = {};
        slotObject.id = slotId;
        slotObject.tokens = tokens;
        slotObject.operators = operators;
        slotObject.owner = owner;

        Chain.store(getKey(SLOT_PRE, slotId), JSON.stringify(slotObject));
    } else {
        slotData = JSON.parse(slotData);
        slotData.tokens = tokens;
        slotData.operators = operators;
        slotData.owner = owner;

        Chain.store(getKey(SLOT_PRE, slotId), JSON.stringify(slotData));
    }
}

// creates a new token under a slot
function mintToken(toAddress, slotId, tokenId, balance) {
    Utils.assert(Utils.addressCheck(toAddress) === true, 'Recipient address is invalid.');
    let tokenKey = getKey(TOKEN_PRE, tokenId);
    let tokenData = Chain.load(tokenKey);
    Utils.assert(tokenData === false, 'Token ID already exists.');
    let slotKey = getKey(SLOT_PRE, slotId);
    let slotData = Chain.load(slotKey);
    // slot does not exist
    if (slotData === false) {
        // create slot
        slotData = {};
        slotData.id = slotId;
        slotData.tokens = [];
        slotData.operators = [];
        slotData.owner = toAddress;
    } else {
        slotData = JSON.parse(slotData);
    }

    // create object
    let tokenObject = {};
    tokenObject.id = tokenId;
    tokenObject.slotId = slotData.id;
    tokenObject.balance = balance;
    tokenObject.owner = toAddress;
    tokenObject.operators = [];

    // store token object
    Chain.store(tokenKey, JSON.stringify(tokenObject));

    // store token key in slot
    slotData.tokens.push(tokenKey);
    Chain.store(slotKey, JSON.stringify(slotData));

    // update balance for recipient
    let recipientKey = getKey(BALANCE_PRE, toAddress);
    let recipientData = Chain.load(recipientKey);

    if (recipientData === false) {
        recipientData = {};
        recipientData.tokens = [];
    } 
    else {
        recipientData = JSON.parse(recipientData);
    }
    recipientData.tokens.push(tokenKey);
    Chain.store(recipientKey, JSON.stringify(recipientData));

    // update total supply
    let currentSupply = totalSupply();
    currentSupply.tokens.push(tokenKey);
    Chain.store(TOTAL_SUPPLY, JSON.stringify(currentSupply));
}

// increase balance of token by "amount"
function mintBalance(tokenId, amount) {
    let tokenKey = getKey(TOKEN_PRE, tokenId);
    let tokenData = Chain.load(tokenKey);
    Utils.assert(tokenData !== false, 'Token does not exist.');
    tokenData = JSON.parse(tokenData);
    Utils.assert(Chain.msg.sender === tokenData.owner || tokenData.operators.includes(Chain.msg.sender), 'Only owner of the token can call this function.');
    tokenData.balance = Utils.int256Add(tokenData.balance, amount);
    Chain.store(tokenKey, JSON.stringify(tokenData));
}

// burn an entire token
function burnToken(tokenId) {
    let tokenKey = getKey(TOKEN_PRE, tokenId);
    let tokenData = Chain.load(tokenKey);
    Utils.assert(tokenData !== false, 'Token does not exist.');
    tokenData = JSON.parse(tokenData);
    Utils.assert(Chain.msg.sender === tokenData.owner || tokenData.operators.includes(Chain.msg.sender), 'Only owner of the token can call this function.');

    // remove token key from slot
    let slotKey = getKey(SLOT_PRE, tokenData.slotId);
    let slotData = Chain.load(slotKey);
    Utils.assert(slotData !== false, 'Slot does not exist.');
    slotData = JSON.parse(slotData);
    slotData.tokens = slotData.tokens.filter(function(token) {
        return token !== tokenKey;
    });
    Chain.store(slotKey, JSON.stringify(slotData));

    // remove token key from owner
    let ownerKey = getKey(BALANCE_PRE, tokenData.owner);
    let ownerData = Chain.load(ownerKey);
    Utils.assert(ownerData !== false, 'Owner data does not exist.');
    ownerData = JSON.parse(ownerData);
    ownerData.tokens = ownerData.tokens.filter(function(token) {
        return token !== tokenKey;
    });
    Chain.store(ownerKey, JSON.stringify(ownerData));

    // update total supply
    let currentSupply = totalSupply();
    currentSupply.tokens = currentSupply.tokens.filter(function(token) {
        return token !== tokenKey;
    });

    Chain.store(TOTAL_SUPPLY, JSON.stringify(currentSupply));

    // remove token from Chain.store
    Chain.del(tokenKey);
}

// decrease a portion (specified by "amount") of the token's balance
function burnBalance(tokenId, amount) {
    let tokenKey = getKey(TOKEN_PRE, tokenId);
    let tokenData = Chain.load(tokenKey);
    Utils.assert(tokenData !== false, 'Token does not exist.');
    tokenData = JSON.parse(tokenData);
    Utils.assert(Chain.msg.sender === tokenData.owner || tokenData.operators.includes(Chain.msg.sender), 'Only owner of the token can call this function.');
    tokenData.balance = Utils.int256Sub(tokenData.balance, amount);
    Chain.store(tokenKey, JSON.stringify(tokenData));
}

// same as transferFrom
function safeTransferFromBalance(fromTokenId, toTokenId, amount) {
    let senderTokenKey = getKey(TOKEN_PRE, fromTokenId);
    let senderTokenData = Chain.load(senderTokenKey);
    Utils.assert(senderTokenData !== false, 'Failed to get storage data, key: ' + senderTokenKey);
    senderTokenData = JSON.parse(senderTokenData);
    Utils.assert(Chain.msg.sender === senderTokenData.owner || senderTokenData.operators.includes(Chain.msg.sender), 'Only owner or operator of the token can call this function.');
    Utils.assert(Utils.int256Compare(senderTokenData.balance, amount) > 0, 'Insufficient balance to transfer amount.');

    let recipientTokenKey = getKey(TOKEN_PRE, toTokenId);
    let recipientTokenData = JSON.parse(Chain.load(recipientTokenKey));
    Utils.assert(recipientTokenData !== false, 'Failed to get storage data, key: ' + recipientTokenKey);
    recipientTokenData = JSON.parse(recipientTokenData);

    // subtract sender balance
    senderTokenData.balance = Utils.int256Sub(senderTokenData.balance, amount);
    Chain.store(senderTokenKey, JSON.stringify(senderTokenData));

    // add recipient balance
    recipientTokenData.balance = Utils.int256Add(recipientTokenData.balance, amount);
    Chain.store(recipientTokenKey, JSON.stringify(recipientTokenData));
}

// transfer balance to another token of the same slot
function transferFromBalance(fromTokenId, toTokenId, amount) {
    let senderTokenKey = getKey(TOKEN_PRE, fromTokenId);
    let senderTokenData = Chain.load(senderTokenKey);
    Utils.assert(senderTokenData !== false, 'Failed to get storage data, key: ' + senderTokenKey);
    senderTokenData = JSON.parse(senderTokenData);
    Utils.assert(Chain.msg.sender === senderTokenData.owner || senderTokenData.operators.includes(Chain.msg.sender), 'Only owner or operator of the token can call this function.');
    Utils.assert(Utils.int256Compare(senderTokenData.balance, amount) > 0, 'Insufficient balance to transfer amount.');

    let recipientTokenKey = getKey(TOKEN_PRE, toTokenId);
    let recipientTokenData = JSON.parse(Chain.load(recipientTokenKey));
    Utils.assert(recipientTokenData !== false, 'Failed to get storage data, key: ' + recipientTokenKey);
    recipientTokenData = JSON.parse(recipientTokenData);

    // subtract sender balance
    senderTokenData.balance = Utils.int256Sub(senderTokenData.balance, amount);
    Chain.store(senderTokenKey, JSON.stringify(senderTokenData));

    // add recipient balance
    recipientTokenData.balance = Utils.int256Add(recipientTokenData.balance, amount);
    Chain.store(recipientTokenKey, JSON.stringify(recipientTokenData));
}

// same as transferFrom
function safeTransferFromToken(tokenId, toAddress) {
    let key = getKey(TOKEN_PRE, tokenId);
    let tokenData = Chain.load(key);
    Utils.assert(tokenData !== false, 'Failed to get storage data, key: ' + key);
    tokenData = JSON.parse(tokenData);
    Utils.assert(Chain.msg.sender === tokenData.owner || tokenData.operators.includes(Chain.msg.sender), 'Only owner of the token can call this function.');
    Utils.assert(Utils.addressCheck(toAddress) === true, 'Recipient address is invalid.');

    // remove the balance of existing owner
    let ownerKey = getKey(BALANCE_PRE, tokenData.owner);
    let ownerData = Chain.load(ownerKey);
    Utils.assert(ownerData !== false, 'Failed to get storage data, key: ' + ownerKey);
    ownerData = JSON.parse(ownerData);
    ownerData.tokens = ownerData.tokens.filter(function(tokenKey) {
        return tokenKey !== key;
    });
    Chain.store(ownerKey, JSON.stringify(ownerData));

    // add the balance to new owner
    let recipientKey = getKey(BALANCE_PRE, toAddress);
    let recipientData = Chain.load(recipientKey);
    // Utils.assert(recipientData !== false, 'Failed to get storage data, key: ' + recipientKey);
    if (recipientData === false) {
        recipientData = {};
        recipientData.tokens = [];
    } else {
        recipientData = JSON.parse(recipientData);
    }
    recipientData.tokens.push(key);
    Chain.store(recipientKey, JSON.stringify(recipientData));

    // update the token owner
    tokenData.owner = toAddress;
    Chain.store(key, JSON.stringify(tokenData));
}

// transfer ownership of token
function transferFromToken(tokenId, toAddress) {
    let key = getKey(TOKEN_PRE, tokenId);
    let tokenData = Chain.load(key);
    Utils.assert(tokenData !== false, 'Failed to get storage data, key: ' + key);
    tokenData = JSON.parse(tokenData);
    Utils.assert(Chain.msg.sender === tokenData.owner || tokenData.operators.includes(Chain.msg.sender), 'Only owner of the token can call this function.');
    Utils.assert(Utils.addressCheck(toAddress) === true, 'Recipient address is invalid.');

    // remove the balance of existing owner
    let ownerKey = getKey(BALANCE_PRE, tokenData.owner);
    let ownerData = Chain.load(ownerKey);
    Utils.assert(ownerData !== false, 'Failed to get storage data, key: ' + ownerKey);
    ownerData = JSON.parse(ownerData);
    ownerData.tokens = ownerData.tokens.filter(function(tokenKey) {
        return tokenKey !== key;
    });
    Chain.store(ownerKey, JSON.stringify(ownerData));

    // add the balance to new owner
    let recipientKey = getKey(BALANCE_PRE, toAddress);
    let recipientData = Chain.load(recipientKey);
    // Utils.assert(recipientData !== false, 'Failed to get storage data, key: ' + recipientKey);
    if (recipientData === false) {
        recipientData = {};
        recipientData.tokens = [];
    } else {
        recipientData = JSON.parse(recipientData);
    }
    recipientData.tokens.push(key);
    Chain.store(recipientKey, JSON.stringify(recipientData));

    // update the token owner
    tokenData.owner = toAddress;
    Chain.store(key, JSON.stringify(tokenData));
}

function init(input_str) {
    let paramObj = JSON.parse(input_str).params;
    Utils.assert(paramObj.name !== undefined && paramObj.name.length > 0, 'Param obj has no name.');
    Utils.assert(paramObj.symbol !== undefined && paramObj.symbol.length > 0, 'Param obj has no symbol.');
    Utils.assert(paramObj.describe !== undefined && paramObj.describe.length > 0, 'Param obj has no describe.');
    Utils.assert(paramObj.version !== undefined && paramObj.version.length > 0, 'Param obj has no version.');

    
    let totalSupplyObject = {};
    totalSupplyObject.tokens = [];
    Chain.store(TOTAL_SUPPLY, JSON.stringify(totalSupplyObject));

    paramObj.protocol = ZTP_PROTOCOL;
    Chain.store(CONTRACT_PRE, JSON.stringify(paramObj));
    return;
}
  
function main(input_str) {
    let input = JSON.parse(input_str);
    if (input.method === "safeTransferFromToken") {
        safeTransferFromToken(input.params.tokenId, input.params.toAddress);
    } else if (input.method === "transferFromToken") {
        transferFromToken(input.params.tokenId, input.params.toAddress);
    } else if (input.method === "safeTransferFromBalance") {
        safeTransferFromBalance(input.params.fromTokenId, input.params.toTokenId, input.params.amount);
    } else if (input.method === "transferFromBalance") {
        transferFromBalance(input.params.fromTokenId, input.params.toTokenId, input.params.amount);
    } else if (input.method === "approve") {
        approve(input.params.operator, input.params.tokenId);
    } else if (input.method === "approveForSlot") {
        approveForSlot(input.params.operator, input.params.slotId);
    } else if (input.method === "approveForAll") {
        approveForAll(input.params.owner, input.params.operator);
    } else if (input.method === "setSlotMetadata") {
        setSlotMetadata(input.params.slotId, input.params.tokens, input.params.operators, input.params.owner);
    } else if (input.method === "mintToken") {
        mintToken(input.params.toAddress, input.params.slotId, input.params.tokenId, input.params.balance);
    } else if (input.method === "mintBalance") {
        mintBalance(input.params.tokenId, input.params.amount);
    } else if (input.method === "burnToken") {
        burnToken(input.params.tokenId);
    } else if (input.method === "burnBalance") {
        burnBalance(input.params.tokenId, input.params.amount);
    } else {
        throw `Error matching strings. Input: ${input}. Method: ${input.method}. Parameters: ${input.params}`;
    }
}
  
function query(input_str) {
    let result = {};
    let input = JSON.parse(input_str);
    if (input.method === "balanceOf") {
        result.balance = balanceOf(input.params.address);
    } else if (input.method === "ownerOf") {
        result.owner = ownerOf(input.params.tokenId);
    } else if (input.method === "getApproved") {
        result.operators = getApproved(input.params.tokenId);
    } else if (input.method === "isApprovedForAll") {
        result.approvedForAll = isApprovedForAll(input.params.owner, input.params.operator);
    } else if (input.method === "isApprovedForSlot") {
        result.isApprovedForSlot = isApprovedForSlot(input.params.slotId, input.params.operator);
    } else if (input.method === "slotOf") {
        result.slot = slotOf(input.params.tokenId);
    } else if (input.method === "contractInfo") {
        result.contractInfo = contractInfo();
    } else if (input.method === "tokenURI") {
        result.tokenURI = tokenURI(input.params.tokenId);
    } else if (input.method === "slotURI") {
        result.slotURI = slotURI(input.params.slotId);
    } else if (input.method === "totalSupply") {
        result.totalSupply = totalSupply();
    } else if (input.method === "tokensOfOwner") {
        result.tokens = tokensOfOwner(input.params.address);
    } else if (input.method === "tokensInSlot") {
        result.tokens = tokensInSlot(input.params.slotId);
    } else if (input.method === "getSlotMetadata") {
        result.slotMetadata = getSlotMetadata(input.params.slotId);
    } else {
        throw `Error matching strings. Input: ${input}. Method: ${input.method}. Parameters: ${input.params}`;
    }

    return JSON.stringify(result);
}
