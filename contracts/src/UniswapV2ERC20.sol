// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './libraries/SafeMath.sol';

contract UniswapV2ERC20 {
    using SafeMath for uint;

    string internal constant _NAME_INTERNAL = 'Uniswap V2';
    string internal constant _SYMBOL_INTERNAL = 'UNI-V2';
    uint8 internal constant _DECIMALS_INTERNAL = 18;
    bytes32 internal constant _PERMIT_TYPEHASH_INTERNAL = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    uint internal s_totalSupply;
    mapping(address => uint) internal s_balanceOf;
    mapping(address => mapping(address => uint)) internal s_allowance;
    bytes32 internal s_DOMAIN_SEPARATOR;
    mapping(address => uint) internal s_nonces;

    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    constructor() {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        s_DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes(_NAME_INTERNAL)),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );
    }

    function name() public pure virtual returns (string memory) {
        return _NAME_INTERNAL;
    }

    function symbol() public pure virtual returns (string memory) {
        return _SYMBOL_INTERNAL;
    }

    function decimals() public pure virtual returns (uint8) {
        return _DECIMALS_INTERNAL;
    }

    function PERMIT_TYPEHASH() public pure virtual returns (bytes32) {
        return _PERMIT_TYPEHASH_INTERNAL;
    }

    function totalSupply() public view virtual returns (uint) {
        return s_totalSupply;
    }

    function balanceOf(address owner) public view virtual returns (uint) {
        return s_balanceOf[owner];
    }

    function allowance(address owner, address spender) public view virtual returns (uint) {
        return s_allowance[owner][spender];
    }

    function DOMAIN_SEPARATOR() public view virtual returns (bytes32) {
        return s_DOMAIN_SEPARATOR;
    }

    function nonces(address owner) public view virtual returns (uint) {
        return s_nonces[owner];
    }

    function _mint(address to, uint value) internal {
        s_totalSupply = s_totalSupply.add(value);
        s_balanceOf[to] = s_balanceOf[to].add(value);
        emit Transfer(address(0), to, value);
    }

    function _burn(address from, uint value) internal {
        s_balanceOf[from] = s_balanceOf[from].sub(value);
        s_totalSupply = s_totalSupply.sub(value);
        emit Transfer(from, address(0), value);
    }

    function _approve(address owner, address spender, uint value) private {
        s_allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint value) private {
        s_balanceOf[from] = s_balanceOf[from].sub(value);
        s_balanceOf[to] = s_balanceOf[to].add(value);
        emit Transfer(from, to, value);
    }

    function approve(address spender, uint value) public virtual returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint value) public virtual returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint value) public virtual returns (bool) {
        if (s_allowance[from][msg.sender] != type(uint256).max) {
            s_allowance[from][msg.sender] = s_allowance[from][msg.sender].sub(value);
        }
        _transfer(from, to, value);
        return true;
    }

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) public virtual {
        require(deadline >= block.timestamp, 'UniswapV2: EXPIRED');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                s_DOMAIN_SEPARATOR,
                keccak256(abi.encode(_PERMIT_TYPEHASH_INTERNAL, owner, spender, value, s_nonces[owner]++, deadline))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'UniswapV2: INVALID_SIGNATURE');
        _approve(owner, spender, value);
    }
} 