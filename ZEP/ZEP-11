# ZEP-11: Adding int256 Integer Structure for Enhanced Scalability and Precision

## Description
This proposal introduces support for the `int256` integer structure in the Zetrix blockchain infrastructure. The inclusion of this feature will expand the blockchain’s computational capabilities, enabling high-precision operations, supporting larger numeric ranges, and addressing limitations encountered with the current `int64` type. This enhancement aligns Zetrix with blockchain industry standards and supports complex applications such as high-value transactions, decentralized finance (DeFi), and advanced smart contracts.

## Author
Maslan Mat Isa

## Discussion
**Summary:**  
The lack of `int256` support has been identified as a limitation in Zetrix, particularly in high-value calculations and smart contracts requiring precision similar to Ethereum's standards. This proposal outlines the implementation of `int256` support to resolve these challenges and prepare Zetrix for future scalability.

## Status
**Proposed**

## Type
**Enhancement**

## Category
**Core Protocol**

## Created
**November 13, 2024**

## Requirements
- **Consensus Upgrade:** A ledger version update is necessary to incorporate this feature, ensuring compatibility and stability across the network.  
- **Technical Dependencies:** The implementation requires the addition of the GMP library for large-integer arithmetic, changes to utility modules, and updates to smart contract modules and node programs.

---

## Additional Details

### Rationale and Background
The current `int64` data type offers efficiency but limits the numeric range, restricting the handling of high-precision operations. For example, tokens requiring precision similar to Ethereum (e.g., `10^18`) exceed the capabilities of `int64`, causing failures in smart contract operations like Uniswap Router contract calculations. Introducing `int256` addresses these challenges by:

- **Expanding Numeric Range:** Supports larger and more complex computations.  
- **Improving Compatibility:** Aligns Zetrix with industry standards for decentralized applications.  
- **Enhancing Security:** Reduces overflow and underflow risks in smart contract execution.  
- **Future-Proofing:** Ensures readiness for high-precision blockchain applications.

### Implementation Plan

#### Development and Code Changes
- **Modules to Update:**
  - Add `int256` and `uint256` support in the utility module.  
  - Integrate GMP library for arithmetic operations.  
  - Implement `int256Add`, `int256Mul`, `int256Sub`, `int256Div`, and `int256Mod`.  
  - Update smart contract modules to handle `int256` operations.

- **Key Code Modifications Completed:**
  - Added GMP library: `/src/3rd/gmp-6.3.0`.  
  - Utility classes: `/src/utils/int256_t.cpp` and `/src/utils/uint256_t.cpp`.  
  - Callback functions: `/src/contract/v8_contract.h` and related implementations.  
  - Updated `CMakeLists` and `Makefiles` for dependencies.  
  - Added unit tests for `int256` operations: `/test/gtest/test/int256_test.cpp`.

### Testing and Validation
- **Unit Tests:** Validate safe arithmetic operations and string conversions.  
- **Integration Tests:** Verify end-to-end system functionality with `int256`.  
- **Compatibility Testing:** Ensure backward compatibility with existing `int64` structures.  
- **Security Audits:** Verify robustness against overflow, underflow, and other vulnerabilities.

### Deployment Strategy
- **Staggered Rollout:** Gradual deployment across selected nodes.  
- **Consensus Upgrade:** Increment ledger version to ensure network-wide compatibility.  
- **Monitoring:** Real-time monitoring of node performance post-deployment.

### Risk and Mitigation
- **Increased Resource Consumption:** Optimize processing to offset higher memory/storage needs.  
- **Backward Compatibility Issues:** Conduct comprehensive testing and provide updates for older clients.  
- **New Vulnerabilities:** Perform thorough security audits to preempt risks.

---

## Conclusion
Adding `int256` to Zetrix strengthens its core infrastructure, expands computational capabilities, and aligns it with leading blockchain platforms. This upgrade ensures readiness for high-value transactions and advanced blockchain applications, driving future growth and adoption.
