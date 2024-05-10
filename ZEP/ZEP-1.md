# ZEP -1 – Purpose and Guideline

## Table of Content
1. [What is ZEP](#what-is-zep)
2. [ZEP Rationale](#zep-rationale)
3. [ZEP Types](#zep-types)
4. [ZEP WorkFlow](#zep-workflow)
    - [Shepherding an ZEP](#shepherding-an-zep)
    - [Core ZEPs](#core-zeps)
    - [ZEP Process](#zep-process)
5. [What belongs in a successful ZEP?](#what-belongs-in-a-successful-zep)
6. [ZEP Formats and Templates](#zep-formats-and-templates)
7. [ZEP Header Preamble](#zep-header-preamble)
8. [Linking to External Resources](#linking-to-external-resources)
9. [Linking to other ZEPs](#linking-to-other-zeps)
10. [Auxiliary Files](#auxiliary-files)
11. [Transferring ZEP Ownership](#transferring-zep-ownership)
12. [ZEP Editors](#zep-editors)
13. [ZEP Editor Responsibilities](#zep-editor-responsibilities)
14. [Style Guide](#style-guide)
15. [ZEP numbers](#zep-numbers)
16. [History](#history)
17. [Copyright](#copyright)

## What is ZEP?
Zetrix Ecosystem Proposals (ZEPs) describe standards for the Zetrix platform, including core protocol specifications, client APIs, and contract standards. ZEPs define standards for building infrastructure on top of the Zetrix network. They are designed to help different entities, such as asset issuers, wallets, exchanges, and other service providers interoperate using a single common integration.

## ZEP Rationale
Our aim is for ZEPs to serve as the primary means of proposing new features, gathering technical insights from the community on specific issues, and documenting the design decisions made for Zetrix. As ZEPs are stored as text files in a versioned repository, their revision history serves as the historical record of each feature proposal.

For developers implementing Zetrix, ZEPs offer a streamlined method for monitoring the progress of their implementation efforts. Ideally, each implementation maintainer would catalog the ZEPs they've incorporated, providing end users with an easy means to track the current status of any given implementation or library.

## ZEP Types
A Standards Track ZEP makes major changes affecting most Zetrix implementations. This includes adjustments to the network protocol, modifications in block or transaction validity criteria, suggested application standards/conventions, or any amendment or addition influencing the interoperability of applications utilizing Zetrix. These ZEPs are composed of three essential components: a design document, an implementation proposal, and if deemed necessary, an update to the formal specification. Additionally, Standards Track ZEPs can be categorized as follows:
- Core - Improvements requiring a consensus such as Gas changes, as well as changes that are not necessarily consensus but heavily involve the core component of Zetrix. Eg: PoS Algorithm. (ZEP-XX)
- Network - Anything related to the network such as Nodes, etc. (ZEP-XX)
- Interface - Includes improvements around client API specifications and standards, and also certain language-level standards like method names and smart contract binaries. (ZEP-XX)
- ZTP - Application-level standards and conventions, including contract standards such as token standards (ZTP-20).
- Information - Describes a Zetrix design issue, or provides general guidelines or information to the Zetrix community, but does not propose a new feature. (ZEP-XX)

## ZEP WorkFlow
### Shepherding an ZEP
Core ZEPs
For Core ZEPs, in order for them to be considered Final and require client implementations, you must either provide an implementation for clients or persuade clients to implement your ZEP. You can request to do so by posting a comment containing a link to your ZEP on an CoreDevs agenda GitHub Issue.

The CoreDevs call serves as a platform for client implementers to achieve three objectives: first, to discuss the technical merits of ZEPs; second, to ascertain which ZEPs other clients will be implementing; and third, to coordinate ZEP implementation for network upgrades.

### ZEP Process
The following is the standardization process for all ZEPs in all tracks:
Idea - An idea that is pre-draft. This is not tracked within the ZEP Repository.
Draft - The initial formally tracked stage of a ZEP in development. A ZEP is merged by a ZEP Editor into the ZEP repository when properly formatted.
Review - A ZEP Author marks a ZEP as ready for and requesting Peer Review.
Last Call - This marks the final review window for a ZEP before moving to Final. A ZEP editor will assign Last Call status and set a review end date (last-call-deadline), typically 14 days later.

If this period results in necessary normative changes, it will revert the ZEP to Review.

Final - This ZEP represents the ultimate standard. A Final ZEP exists in a state of finality and should only be updated to correct errata and add non-normative clarifications.

A PR moving a ZEP from Last Call to Final SHOULD contain no changes other than the status update. Any content or editorial proposed change SHOULD be separate from this status-updating PR and committed prior to it.

Stagnant/Idle - Any ZEP in Draft or Review or Last Call if inactive for a period of 6 months or greater is moved to Stagnant. A ZEP may be resurrected from this state by Authors or ZEP Editors by moving it back to Draft or its earlier status. If not resurrected, a proposal may stay forever in this status.

ZEP Authors are notified of any algorithmic change to the status of their ZEP.

Withdrawn - The ZEP Author(s) have withdrawn the proposed ZEP. This state has finality and can no longer be resurrected using this ZEP number. If the idea is pursued at a later date, it is considered a new proposal.

Living - A special status for ZEPs that are designed to be continually updated and not reach a state of finality. This includes most notably ZEP-1.

## What belongs in a successful ZEP?
# Abstract

The Abstract serves as a concise technical summary, typically consisting of multiple sentences forming a short paragraph. It should offer an easily understandable overview of the specification. Ideally, someone should be able to grasp the essence of what the specification entails by reading only the abstract.

## Motivation

A motivation section is crucial for ZEPs aiming to alter the Zetrix protocol. It must effectively articulate why the current protocol specification falls short in addressing the problem that the ZEP aims to resolve. However, this section may be omitted if the motivation behind the proposal is self-evident.

## Specification

The technical specification must outline the syntax and semantics of any proposed new feature comprehensively.

## Rationale

The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work.

## Backwards Compatibility (optional)

For all ZEPs introducing backwards incompatibilities, a section detailing these discrepancies and their implications must be included. The ZEP should elucidate how the author intends to address these incompatibilities. This section may be excluded if the proposal does not introduce any backwards incompatibilities, but it becomes obligatory if such incompatibilities do exist.

## Test Cases (optional)

Test cases for an implementation are mandatory for ZEPs that are affecting consensus changes.

## Reference Implementation (optional)

An optional section that contains a reference/example implementation that people can use to assist in understanding or implementing this specification. This section may be omitted for all ZEPs.

## Security Considerations

Each ZEP must feature a dedicated section discussing the security implications or considerations pertinent to the proposed alteration. This section should encompass information crucial for security discussions, highlighting potential risks and serving as a reference throughout the proposal's lifecycle. It should encompass security-relevant design choices, concerns, significant discussions, implementation-specific guidance, potential pitfalls, an overview of threats and risks, and strategies for addressing them. ZEP submissions lacking the "Security Considerations" section will not be accepted. Additionally, a ZEP cannot progress to the "Final" status until its Security Considerations discussion is deemed satisfactory by the reviewers.

## ZEP Formats and Templates
- Title
- Description
- Author
- Discussion
- Status
- Type
- Category
- Created
- Require

# ZEP Header Preamble

- zep: ZEP number
- title: The ZEP title is a few words, not a complete sentence
- description: Description is one full (short) sentence
- author:
  - Author Name (@username)
  - Co-author Name (@username)
- discussions-to: The URL pointing to the official discussion thread
- status: Draft, Review, Last Call, Final, Stagnant, Withdrawn, Living
- type: One of Standards Track, Meta, or Informational
- category: One of Core, Networking, Interface, or ZTP (Optional field, only needed for Standards Track ZEPs)
- created: Date the ZEP was created on

## Linking to other ZEPs

References to other ZEPs should follow the format ZEP-N where N is the ZEP number you are referring to.

## Auxiliary Files

Images, diagrams, and additional files should be placed in a subdirectory within the assets folder specific to that ZEP as shown: assets/zep-N (replace N with the ZEP number). When referencing an image within the ZEP, use relative links like ../assets/zep-1/image.png.

## Transferring ZEP Ownership

Valid reasons for transferring ownership include the original author's lack of time or interest in updating or advancing the ZEP, or if they have become unresponsive or unreachable. However, disagreeing with the direction of the ZEP is not a valid reason for ownership transfer. While we strive to reach a consensus on a ZEP, if consensus cannot be reached, submitting a competing ZEP is always an option.

## ZEP Editors

The current ZEP editors are:

- Maslan Mat Isa (@maslan.isa)
# ZEP Editor Responsibilities

For each new ZEP submitted, an editor performs the following tasks:

1. Review the ZEP for Readiness:

- Ensure the ZEP is technically sound and complete, even if it may not ultimately reach final status.
- Verify that the title accurately reflects the content.

2. Check for Quality and Consistency:

- Review the ZEP for language accuracy (spelling, grammar, sentence structure).
- Confirm the code style and formatting.

3. Provide Feedback for Revision:

- If the ZEP is not yet ready, the editor will return it to the author with specific revision instructions.

  Once the ZEP is deemed ready for inclusion in the repository, the editor will:

1.  Assign a ZEP Number:
  - Numbers are generally assigned incrementally, though editors can reassign if "number sniping" is suspected.
2.  Merge the Pull Request:
  - Complete the corresponding pull request to add the ZEP to the repository.
3. Notify the ZEP Author:
  - Send a message to the ZEP author outlining the next steps in the process.

The role of the editors is administrative and editorial; they do not pass judgment on the content or merits of the ZEPs.

## Style Guide

### Titles

In the preamble's title field:
- Avoid using the word "standard" or any of its variations.
- Do not include the ZEP number in the title.

### Descriptions

In the preamble's description field:
- Avoid using the word "standard" or any of its variations.
- Do not include the ZEP number in the description.

## ZEP Numbers

When referencing a ZEP, use the following format based on its category:
- For ZEPs categorized as ZTP: ZTP-X, where X is the ZEP's assigned number.
- For ZEPs in any other category: ZEP-X, where X is the ZEP's assigned number.

## History

This document draws heavily from Bitcoin's BIP-0001, authored by Amirudin, which itself was derived from Python's PEP-0001. While the original PEP-0001 text was written by Barry Warsaw, Jeremy Hylton, and David Goodger, they are not responsible for its use in the Zcash Improvement Process and should not be contacted with technical questions specific to Zcash or the ZEP. Please direct all comments to the ZEP editors.

## Copyright

Copyright and related rights.

## Citation

Aidil Safuan, H. (n.d.). An Interesting Article. [Link](https://doi.org/00.0000/a00000-000-0000-y) (Original work published 2022).




