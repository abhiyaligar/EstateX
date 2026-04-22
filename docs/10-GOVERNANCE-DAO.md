# 10. DAO-Style Governance & Voting Rights

## Overview

The EstateX Governance system empowers fractional property owners (Brick Holders) to influence key management decisions. By implementing a weighted voting mechanism, the platform ensures that project direction is determined by those with the greatest economic stake.

## 1. Weighted Voting Mechanics

### 1.1 The "Brick" as a Governance Unit
- **Influence Calculation**: 1 Brick = 1 Vote.
- **Proportionality**: A user's voting power is exactly equal to their fractional ownership percentage of the specific asset.
- **Project Isolation**: Voting rights are asset-specific. Holding bricks in Project A does not grant voting rights in Project B.

### 1.2 Snapshot Protocol
To prevent "flash-loan" style manipulation or last-minute equity transfers to influence outcomes:
- **Vote-Time Snapshot**: The system queries the `brick_holdings` table at the exact millisecond a vote is cast.
- **Immutable Weight**: Once a vote is cast, its weight is locked to the snapshot value, even if the user sells their bricks before the proposal closes.

## 2. Proposal Lifecycle

Governance decisions follow a strict state-machine lifecycle:

1.  **Draft/Initialized**: Admin creates the proposal with options and a deadline.
2.  **Active**: The proposal is open for voting by verified investors.
3.  **Closed**: The deadline has passed. No further votes are accepted.
4.  **Executed**: The administrator has acknowledged the consensus and triggered the resulting action.

## 3. Administrator Management Suite

Located in the **Admin Portal > Governance** tab:
- **Proposal Creation**: Define the target asset, title, detailed rationale, and multiple choice options (e.g., "Yes", "No", "Abstain").
- **Deadline Configuration**: Set precise UTC timestamps for voting closure.
- **Result Execution**: View the final weighted distribution and officially "Execute" the winning consensus.

## 4. User Interface Integrations

### 4.1 Property Details Section
A dedicated **Governance & DAO** section appears on every property page where `ipo_status === 'completed'`.
- **Progress Tracking**: Real-time visualization of vote distribution.
- **Eligibility Check**: Automatic detection of the user's holding status to enable/disable voting buttons.

### 4.2 Secondary Market Terminal
For professional traders, a **GOVERNANCE** tab is integrated directly into the high-density trading terminal.
- **Contextual Voting**: Vote on proposals for the asset currently being traded without navigating away from the orderbook.

## 5. Security & Risk Mitigation

- **Sybil Resistance**: Voting requires both a verified KYC profile and active capital commitment (bricks).
- **Integrity Checks**: Backend validates that the `project_id` in the vote matches the proposal's target asset.
- **Duplicate Prevention**: Database constraints prevent a single user from casting multiple votes on the same proposal.
