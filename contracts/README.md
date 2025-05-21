## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/DeployEasyStakeVault.s.sol:DeployEasyStakeVault \
  --rpc-url https://rpc-testnet.nerochain.io/ \
  --broadcast \
  -- --max-priority-fee-per-gas 1000000000 \
  --max-fee-per-gas 2000000000 \
  -vvvv
```

```shell
forge script script/DeployUniswap.s.sol:DeployUniswap \
  --rpc-url https://rpc-testnet.nerochain.io/ \
  --broadcast \
  -- --max-priority-fee-per-gas 10000000000 \
  --max-fee-per-gas 20000000000 \
  -vvvv
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
