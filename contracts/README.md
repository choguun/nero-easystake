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
  --priority-gas-price 5gwei \
  --with-gas-price    5gwei \
  -vvvv
```

```shell
 forge script script/DeploySwap.s.sol:DeploySwap --sig "run(address)" 0xB4f8075aC4be8135b4B746813b5f5fE2cFf842DD \
  --rpc-url        https://rpc-testnet.nerochain.io/ \
  --broadcast \
  --priority-gas-price 5gwei \
  --with-gas-price    5gwei \
  -vvvv
```

```shell
  forge script script/DepositEthToVault.s.sol:DepositEthToVault \
  --rpc-url https://rpc-testnet.nerochain.io \
  --broadcast \
  --priority-gas-price 5gwei \
  --with-gas-price    5gwei \
  -vvvv

  forge script script/AddLiquidity.s.sol:AddLiquidity \
  --rpc-url https://rpc-testnet.nerochain.io \
  --broadcast \
  --priority-gas-price 5gwei \
  --with-gas-price    5gwei \
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
