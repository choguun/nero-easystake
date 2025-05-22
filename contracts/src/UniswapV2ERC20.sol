// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./interfaces/IUniswapV2ERC20.sol";

contract UniswapV2ERC20 is IUniswapV2ERC20 {
    string internal constant _NAME = 'Uniswap V2';
    string internal constant _SYMBOL = 'UNI-V2';
    uint8 internal constant _DECIMALS = 18;

    uint internal _totalSupply;
    mapping(address => uint) internal _balanceOf;
    mapping(address => mapping(address => uint)) internal _allowance;

    bytes32 internal _DOMAIN_SEPARATOR;
    bytes32 internal constant _PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    mapping(address => uint) internal _nonces;

    constructor() {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes(_NAME)),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );
    }

    function name() public pure virtual override returns (string memory) {
        return _NAME;
    }

    function symbol() public pure virtual override returns (string memory) {
        return _SYMBOL;
    }

    function decimals() public pure virtual override returns (uint8) {
        return _DECIMALS;
    }

    function totalSupply() public view virtual override returns (uint) {
        return _totalSupply;
    }

    function balanceOf(address owner) public view virtual override returns (uint) {
        return _balanceOf[owner];
    }

    function allowance(address owner, address spender) public view virtual override returns (uint) {
        return _allowance[owner][spender];
    }

    function DOMAIN_SEPARATOR() public view virtual returns (bytes32) {
        return _DOMAIN_SEPARATOR;
    }

    function PERMIT_TYPEHASH() public pure virtual returns (bytes32) {
        return _PERMIT_TYPEHASH;
    }

    function nonces(address owner) public view virtual returns (uint) {
        return _nonces[owner];
    }
    function _mint(address to, uint value) internal {
        _totalSupply = _totalSupply + value;
        _balanceOf[to] = _balanceOf[to] + value;
        emit Transfer(address(0), to, value);
    }
    function _burn(address from, uint value) internal {
        _balanceOf[from] = _balanceOf[from] - value;
        _totalSupply = _totalSupply - value;
        emit Transfer(from, address(0), value);
    }

    function _approve(address owner, address spender, uint value) private {
        _allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
    function _transfer(address from, address to, uint value) private {
        _balanceOf[from] = _balanceOf[from] - value;
        _balanceOf[to] = _balanceOf[to] + value;
        emit Transfer(from, to, value);
    }

    function approve(address spender, uint value) public virtual override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint value) public virtual override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint value) public virtual override returns (bool) {
        if (_allowance[from][msg.sender] != type(uint256).max) {
            _allowance[from][msg.sender] = _allowance[from][msg.sender] - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) public virtual override {
        require(deadline >= block.timestamp, 'UniswapV2: EXPIRED');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                _DOMAIN_SEPARATOR,
                keccak256(abi.encode(_PERMIT_TYPEHASH, owner, spender, value, _nonces[owner]++, deadline))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'UniswapV2: INVALID_SIGNATURE');
        _approve(owner, spender, value);
    }
}