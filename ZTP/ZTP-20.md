# Contents

1. [Introduction](#introduction)	3
2. [What is the Token Standard](#what-is-the-token-standard)	3
3. [What is ZTP-20](#what-is-ztp-20)	3
4. [Methods](#methods)	4
5. [Example](#example)	5
6. [Use Case](#use-case)	9
    - [Utility Tokens](#utility-tokens)	9
    - [Stablecoins](#stablecoins)	9
    - [Decentralized Exchanges (DEXs)](#decentralized-exchanges-dexs)	9
    - [Lending and Borrowing Platforms](#lending-and-borrowing-platforms)	9
    - [Tokenized Assets and Securities](#tokenized-assets-and-securities)	9

# Introduction

A token standard is a set of rules and specifications that define how a particular type of token should be created, transferred, and managed on a blockchain platform. These standards ensure interoperability, consistency, and security across different tokens built on the same blockchain.

These token standards provide a foundation for developers to create tokens that are compatible with various decentralized applications (dApps), decentralized finance (DeFi) platforms, and other blockchain-based projects. By adhering to these standards, tokens can be easily integrated, traded, and managed across different platforms and ecosystems.

# What is the Token Standard

ZTP-20 is the standard interface for Fungible tokens. This interface enables users to perform actions such as minting and transferring tokens. By adopting this default standard, contracts utilizing ZTP-20 can seamlessly integrate with various services across the network.

# What is ZTP-20

ZTP-20 is the standard interface for Fungible tokens. This interface enables users to perform actions such as minting and transferring tokens. By adopting this default standard, contracts utilizing ZTP-20 can seamlessly integrate with various services across the network.

# Methods
# Contract Methods

## Token definition

Notes: Token definitions are defined during the init procedure.

- **name**
  - Token Name. Example: “Global Coin”
- **symbol**
  - Token Symbol. Example: GCN
- **describe**
  - Token description: “Global coin token issued by XYZ”
- **decimals**
  - Token decimal places.
- **version**
  - Token version

## Example

```javascript
function init() {
  let paramObj;
  paramObj.name = "Global Coin";
  paramObj.symbol = "GCN";
  paramObj.describe = "Global coin token issued by XYZ";
  paramObj.version = "1";
  paramObj.decimals = 8;
  paramObj.protocol = "ztp20"; // To define that this contract is ZTP-20 standards

  Chain.store("contract_info", JSON.stringify(paramObj));
}
```

## Function implementation

## balanceOf(address)

Returns the account balance of another account with address Utils.addressCheck(address)

### Example

```javascript
function balanceOf(address) {
  Utils.assert(Utils.addressCheck(address) === true, 'Arg-address is not a valid address.');

  let value = Chain.load(address);
  return value === false ? "0" : value;
}
````
# Function Implementation: approve(spender, value)

Allows Utils.addressCheck(spender) to withdraw from your account multiple times, up to the Utils.stoI64Check(value) amount. If this function is called again it overwrites the current allowance with Utils.stoI64Check(value).

## Example

```javascript
function approve(spender, value) {
  Utils.assert(Utils.addressCheck(spender) === true, 'Arg-spender is not a valid address.');
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, '0') >= 0, 'Arg-value of spender ' + spender + ' must greater or equal to 0.');

  let key = makeAllowanceKey(Chain.msg.sender, spender);
  Chain.store(key, value);

  Chain.tlog('Approve', Chain.msg.sender, spender, value);

  return true;
}
```
# Function Implementation: allowance(owner, spender)

Allowance is a way for a token holder to give another address permission to transfer a certain amount of their token.

## Example

```javascript
function allowance(owner, spender) {
  Utils.assert(Utils.addressCheck(owner) === true, 'Arg-owner is not a valid address.');
  Utils.assert(Utils.addressCheck(spender) === true, 'Arg-spender is not a valid address.');

  let key = makeAllowanceKey(owner, spender);
  let value = Chain.load(key);
  Utils.assert(value !== false, 'Failed to get the allowance given to ' + spender + ' by ' + owner + ' from metadata.');

  return value;
}
```
# Function Implementation: transfer(to, value)

Transfers senderValue amount of tokens to Utils.addressCheck(to), and MUST fire the Transfer event. The function SHOULD throw if the message caller’s account balance does not have enough tokens to spend.

## Contract transfer function:

```javascript
function transfer(to, value) {
  Utils.assert(Utils.addressCheck(to) === true, 'Arg-to is not a valid address.');
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, '0') > 0, 'Arg-value must be greater than 0.');
  Utils.assert(Chain.msg.sender !== to, 'From cannot equal to address.');

  let senderValue = Chain.load(Chain.msg.sender);
  Utils.assert(senderValue !== false, 'Failed to get the balance of ' + Chain.msg.sender + ' from metadata.');
  Utils.assert(Utils.int64Compare(senderValue, value) >= 0, 'Balance:' + senderValue + ' of sender:' + Chain.msg.sender + ' < transfer value:' + value + '.');

  let toValue = Chain.load(to);
  toValue = (toValue === false) ? value : Utils.int64Add(toValue, value);
  Chain.store(to, toValue);

  senderValue = Utils.int64Sub(senderValue, value);
  Chain.store(Chain.msg.sender, senderValue);

  Chain.tlog('Transfer', Chain.msg.sender, to, value);

  return true;
}
```
# Function Implementation: transferFrom(from, to, value)

Transfers Utils.stoI64Check(value) amount of tokens from Utils.addressCheck(from) to address Utils.addressCheck(to), and MUST fire the Transfer event.

## Example

```javascript
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
  toValue = (toValue === false) ? value : Utils.int64Add(toValue, value);
  Chain.store(to, toValue);

  fromValue = Utils.int64Sub(fromValue, value);
  Chain.store(from, fromValue);

  let allowKey = makeAllowanceKey(from, Chain.msg.sender);
  allowValue = Utils.int64Sub(allowValue, value);
  Chain.store(allowKey, allowValue);

  Chain.tlog('Transfer', from, to, value);

  return true;
}
```
# Function Implementation: query(input_str)

The ERC-20 standard defines a set of common functions for managing and interacting with tokens, such as balanceOf, transfer, approve, allowance, and transferFrom.

## Example

```javascript
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
```
# Function Implementation: deposit(value)

The deposit function is a custom function that can be implemented in a smart contract to allow users to deposit funds or tokens into the contract.

## Example

```javascript
function deposit(value) {
  Utils.assert(Utils.stoI64Check(value) === true, 'Arg-value must be alphanumeric.');
  Utils.assert(Utils.int64Compare(value, Chain.msg.coinAmount) === 0, 'Arg-value must equal pay coin amount.');
  Utils.assert(Utils.int64Compare(value, "0") > 0, 'Arg-value must > 0.');
  let senderValue = Chain.load(Chain.msg.sender);
  senderValue = (senderValue === false) ? value : Utils.int64Add(senderValue, value);
  Chain.store(Chain.msg.sender, senderValue);
  Chain.tlog('Deposit', Chain.msg.sender, value);
  Chain.tlog('Transfer', "0x", Chain.msg.sender, value);
  return true;
}
```
# Function Implementation: withdrawal(value)

The withdrawal function is a custom function that can be implemented in a smart contract to allow users to withdraw funds or tokens from the contract.

## Example

```javascript
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
```
# Use Case

## Utility Tokens

Projects could issue ZTP20 tokens as utility tokens to provide access to specific services or features within their platforms. For example, a decentralized application (dApp) could use ZTP20 tokens to grant users access to premium features or content.

## Stablecoins

Stablecoins like ZTether (ZUSD) or ZCoin (ZC) could be created as ZTP20 tokens pegged to the value of fiat currencies or other assets. These stablecoins could be used for trading, remittances, and as a store of value within the ZETRIX ecosystem due to their price stability.

## Decentralized Exchanges (DEXs)

ZTP20 tokens could be the primary assets traded on decentralized exchanges built on the ZETRIX blockchain. Users could trade ZTP20 tokens directly from their ZETRIX wallets without the need for intermediaries, providing greater control and privacy over their assets.

## Lending and Borrowing Platforms

DeFi platforms on the ZETRIX blockchain could allow users to lend and borrow ZTP20 tokens using smart contracts. These platforms could utilize ZTP20 tokens as collateral for loans, enabling users to earn interest on their deposits or borrow assets against their holdings.

## Tokenized Assets and Securities

ZTP20 tokens could be used to represent tokenized assets, such as real estate, commodities, and traditional securities like stocks and bonds. These tokenized assets could be traded and transferred on the ZETRIX blockchain, providing increased liquidity and accessibility to traditional asset classes.
