# NERO EasyStake

---

## 1. Introduction: The Problem & Solution

### Problem
Staking NERO, while essential for network security and yield generation, presents challenges for many users: complex validator selection, the need to manage NERO gas for transactions (claiming, restaking), illiquidity of staked assets, and anxiety over private key security. These factors hinder broader participation, especially among non-expert users.

### Solution
NERO EasyStake is a liquid staking platform designed for maximum simplicity and security on NERO Chain. Users deposit NERO and receive `stNERO` (a liquid token representing their staked NERO + rewards), which can be used across the NERO DeFi ecosystem. EasyStake abstracts away complexities by leveraging NERO's native DPoSA consensus and, crucially, its advanced Account Abstraction (AA) and Paymaster features.

### Target Audience
* NERO holders seeking passive income
* DeFi users wanting capital efficiency
* Crypto newcomers
* Users prioritizing ease-of-use and security

---

## 2. AA Integration Vision

NERO EasyStake's core innovation lies in its deep integration with NERO's AA Platform (Paymaster) and AA wallets to create a seamless user experience:

* **Gasless First Stake:** To eliminate initial friction, the EasyStake dApp uses the `Developer SDK` to interact with the `Paymaster API`. A dedicated EasyStake `Paymaster` (managed via the `AA Platform`) sponsors the gas fee for a user's first staking deposit (up to a defined limit). The user signs the action via their `AA wallet`, sees a `$0` fee, and the transaction (`UserOperation`) is processed via `Bundlers` and the `Entrypoint`.
* **Pay Staking Fees with Rewards:** Users can opt to pay gas fees for claiming rewards or unstaking directly with a small portion of their earned `stNERO`. The dApp uses the `Developer SDK` and `Paymaster API` (potentially consulting a `Price Service` for `stNERO`/NERO rates) to enable a specific `Paymaster`. This `Paymaster` pays the NERO gas upfront and collects the fee in `stNERO` from the user's `AA wallet` during the `postOp` phase managed by the `Entrypoint`. This removes the need for users to maintain a separate NERO balance for routine staking operations.
* **Automated Compounding (AA Wallet Feature):** Users can authorize (via their `AA wallet`'s programmability) a trusted keeper service to execute periodic batch `UserOperations`. These operations, processed via the `Entrypoint`, bundle claiming and restaking actions into one efficient transaction, maximizing yield automatically. Gas can be sponsored or paid via the "Pay with Rewards" mechanism.
* **Social Recovery (AA Wallet Security):** EasyStake promotes the use of `AA wallet` social recovery. Users can designate guardians to help recover access if they lose their primary key, leveraging the inherent security features of the `AA wallet` contract itself, making asset management less intimidating.

---

## 3. Clarity & Structure

* **Value Proposition:** The simplest, safest way to stake NERO and earn yield, while keeping your capital liquid (`stNERO`).
* **User Flow:**
    * Connect `AA Wallet`.
    * Stake NERO (first time potentially gasless). Receive `stNERO`.
    * Earn yield (reflected in `stNERO` value/balance).
    * Claim rewards / Unstake (option to pay gas with `stNERO`).
    * (Optional) Enable auto-compounding.
    * (Setup) Configure social recovery guardians.
* **Architecture:** The platform utilizes a standard NERO AA architecture: Frontend (`dApp`) -> `Developer SDK` -> `AA Wallet` -> `UserOperation` generation -> Interaction with `Paymaster API` / `AA Platform` -> Submission to `Bundlers` -> Execution via `Entrypoint` -> Interaction with `Paymaster` contracts and `EasyStake Core Contract` / `stNERO Token`.
* **Diagrams:** Detailed Mermaid diagrams illustrating the Gasless First Stake, Pay Fees with Rewards, Auto-Compounding, and High-Level Architecture flows are included below (or in linked files) to visually clarify the AA integration and structure.

    ```mermaid
        sequenceDiagram
        participant User
        participant EasyStakeFE [EasyStake Frontend]
        participant UserAAWallet [User's AA Wallet]
        participant FirstStakePaymaster [EasyStake Paymaster (Sponsor)]
        participant NeroEntryPoint [NERO EntryPoint]
        participant EasyStakeCore [EasyStake Core Contract]

        User->>EasyStakeFE: Connect Wallet (Assume AA Wallet exists/deployed)
        User->>EasyStakeFE: Enters Amount NERO, Clicks "Stake" (First time)
        EasyStakeFE->>UserAAWallet: Prepare Stake UserOp (Deposit NERO, Mint stNERO)
        EasyStakeFE->>FirstStakePaymaster: Request Sponsorship for UserOp
        FirstStakePaymaster->>FirstStakePaymaster: Verify: Is first stake for UserAAWallet? (Yes)
        FirstStakePaymaster->>UserAAWallet: Agree to Sponsor (Provide PaymasterAndData)
        UserAAWallet->>EasyStakeFE: UserOp ready (Gas Sponsored)
        EasyStakeFE->>User: Request Signature (Action: Stake X NERO, Fee: $0)
        User->>UserAAWallet: Sign UserOp
        UserAAWallet->>NeroEntryPoint: Submit UserOp (via Bundler/RPC)
        NeroEntryPoint->>FirstStakePaymaster: Validate Paymaster sponsorship
        NeroEntryPoint->>UserAAWallet: Validate UserOp Signature
        NeroEntryPoint->>UserAAWallet: Execute Call to EasyStakeCore.stake(amount)
        EasyStakeCore->>EasyStakeCore: Receive NERO, Mint stNERO to UserAAWallet
        NeroEntryPoint->>FirstStakePaymaster: postOp (Paymaster pays NERO gas)
        NeroEntryPoint-->>UserAAWallet: Success
        EasyStakeFE-->>User: Staking Successful! Received stNERO.

    ```
    ```mermaid
        sequenceDiagram
        participant User
        participant EasyStakeFE [EasyStake Frontend]
        participant UserAAWallet [User's AA Wallet]
        participant RewardsPaymaster [EasyStake Paymaster (Pay with stNERO)]
        participant NeroEntryPoint [NERO EntryPoint]
        participant EasyStakeCore [EasyStake Core Contract]
        participant stNEROToken [stNERO Token Contract]

        User->>EasyStakeFE: Clicks "Claim Rewards"
        EasyStakeFE->>EasyStakeFE: Offers option: "Pay gas with stNERO?"
        User->>EasyStakeFE: Selects "Yes"
        EasyStakeFE->>UserAAWallet: Prepare Claim UserOp (Call EasyStakeCore.claimRewards)
        EasyStakeFE->>RewardsPaymaster: Request Sponsorship (Pay gas with stNERO)
        RewardsPaymaster->>RewardsPaymaster: Calculate stNERO fee, Verify user balance/approval
        RewardsPaymaster->>UserAAWallet: Agree to Sponsor (Provide PaymasterAndData specifying stNERO fee)
        UserAAWallet->>EasyStakeFE: UserOp ready
        EasyStakeFE->>User: Request Signature (Action: Claim Rewards, Fee: X stNERO)
        User->>UserAAWallet: Sign UserOp
        UserAAWallet->>NeroEntryPoint: Submit UserOp
        NeroEntryPoint->>RewardsPaymaster: Validate Paymaster sponsorship
        NeroEntryPoint->>UserAAWallet: Validate UserOp Signature
        NeroEntryPoint->>UserAAWallet: Execute Call to EasyStakeCore.claimRewards()
        EasyStakeCore->>EasyStakeCore: Calculate rewards, Credit stNERO/rewards to UserAAWallet
        NeroEntryPoint->>RewardsPaymaster: postOp (Paymaster pays NERO gas)
        RewardsPaymaster->>stNEROToken: Instruct transfer of stNERO fee from UserAAWallet to Paymaster Address
        stNEROToken -->> RewardsPaymaster: Fee Transferred
        NeroEntryPoint-->>UserAAWallet: Success
        EasyStakeFE-->>User: Rewards Claimed! (Small stNERO fee deducted)
    ```
    ```mermaid
        sequenceDiagram
        participant Keeper as Authorized Keeper Service
        participant UserAAWallet as User's AA Wallet
        participant AutoCompoundPaymaster as EasyStake Paymaster (Optional)
        participant NeroEntryPoint as NERO EntryPoint
        participant EasyStakeCore as EasyStake Core Contract
        Note over Keeper: Runs periodically based on user setting
        Keeper->>UserAAWallet: Prepare Batch UserOp [ClaimRewards, StakeRewards]
        Note over UserAAWallet: AA Wallet logic permits Keeper only for this batch.
        alt Gas Paid by Platform/Paymaster
            Keeper->>AutoCompoundPaymaster: Request Sponsorship for UserOp
            AutoCompoundPaymaster->>UserAAWallet: Agree to Sponsor
        else Gas Paid by User Wallet (Requires NERO balance)
            Note over Keeper: UserOp includes standard gas payment
        end
        UserAAWallet->>NeroEntryPoint: Submit UserOp (signed by Keeper, authorized by Wallet config)
        NeroEntryPoint->>UserAAWallet: Validate UserOp (checks signature + AA Wallet's internal rules allowing Keeper)
        opt Paymaster Used
        NeroEntryPoint->>AutoCompoundPaymaster: Validate Paymaster sponsorship
        end
        NeroEntryPoint->>UserAAWallet: Execute Batch Calls:
        Note right of NeroEntryPoint: 1. EasyStakeCore.claimRewards()
        Note right of NeroEntryPoint: 2. EasyStakeCore.stake() [Effectively restakes rewards]
        opt Paymaster Used
        NeroEntryPoint->>AutoCompoundPaymaster: postOp (Paymaster pays gas, may deduct fee if configured)
        end
        NeroEntryPoint-->>UserAAWallet: Success (Rewards Compounded)
    ```
    ```mermaid
        graph TD
        U[User] --> FE[EasyStake Frontend]
        FE --> AAW[User's AA Wallet]

        subgraph NERO_Chain
            EP[EntryPoint Contract]
            ESC[EasyStake Core Contract]
            STN[stNERO Token ERC20]
            P1[Paymaster: First Stake Sponsor]
            P2[Paymaster: Pay with Rewards]
            P3[Paymaster: Auto-Compound Sponsor]
            REG[Registry: First Stake Check]
        end

        AAW -->|Submit UserOp| EP
        EP -->|validateUserOp| AAW
        EP -->|validatePaymasterUserOp| P1
        EP -->|validatePaymasterUserOp| P2
        EP -->|validatePaymasterUserOp| P3
        EP -->|executeUserOp| AAW
        AAW -->|delegatecall/call| ESC
        ESC -->|interacts with| STN
        EP -->|postOp| P1
        EP -->|postOp| P2
        EP -->|postOp| P3
        P1 -->|reads| REG
        P2 -->|instructs fee transfer| STN

        K[Keeper Service] -->|Submit UserOp for Auto-Compound| EP

        style P1 fill:#f9d,stroke:#333,stroke-width:1px
        style P2 fill:#f9d,stroke:#333,stroke-width:1px
        style P3 fill:#f9d,stroke:#333,stroke-width:1px
        style EP fill:#ccf,stroke:#333,stroke-width:2px
        style AAW fill:#d3d3d3,stroke:#333,stroke-width:2px
    ```
---

## 4. Innovation & Relevance

* **UX Innovation:** While liquid staking exists, EasyStake's innovation lies in its *obsessive focus on UX simplification* by deeply integrating NERO's specific AA/Paymaster features to remove common friction points (gas fees, complex actions).
* **Relevance to NERO:**
    * Directly leverages and showcases NERO's unique selling points: Account Abstraction and the Paymaster system.
    * Built upon NERO's core DPoSA consensus mechanism, contributing to network security through delegated stakes.
    * The `stNERO` token enhances DeFi composability within the NERO ecosystem.

---

## 5. User Impact & Simplicity

* **Web2 Experience:** Aims for a "set it and forget it" feel similar to traditional finance applications, abstracting away blockchain complexities like gas management.
* **Accessibility:** Designed for non-experts, crypto newcomers, and those intimidated by typical DeFi interactions.
* **Reduced Anxiety:** Addresses key user fears around gas costs and key management (via social recovery).

---

## 6. Marketing & Ecosystem Fit

* **Attracts Users & TVL:** Has strong potential to attract new users and significant Total Value Locked (TVL) to the NERO ecosystem due to its simplicity and utility.
* **Showcases NERO:** Serves as a prime example of the user-friendly dApps possible on NERO Chain thanks to its AA infrastructure.
* **Marketing Hook:** *"NERO EasyStake: Unlock Effortless NERO Yield."* (or your chosen tagline)

---

## 7. Continuity Potential

* **Roadmap:**
    * **Wave 1:** Ideation, detailed AA design, core flow diagrams.
    * **Wave 2:** Build basic staking/unstaking MVP; implement Gasless First Stake `Paymaster`.
    * **Wave 3:** Implement Pay-with-Rewards `Paymaster`; develop `stNERO` tokenomics.
    * **Wave 4:** Build Auto-Compounding feature (AA batching + keeper); integrate Social Recovery setup UI.
    * **Wave 5-6:** Refine UX, security audits, explore `stNERO` DeFi integrations.
* **Commitment:** We are committed to developing NERO EasyStake through subsequent WaveHack waves and potentially beyond, believing it fills a crucial need in the NERO ecosystem.

---

## 8. Team Credibility

> As a blockchain enthusiast with experience in DeFi, AI, Blockchain, I am dedicated to exploring and implementing NERO's AA features to build user-centric applications. This detailed proposal reflects a thorough understanding of the requirements and a strong commitment to realizing this project
---