// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VoluntarioToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("Token de Voluntariado", "VOL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Por ahora, el desplegador también puede acuñar tokens para pruebas.
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public virtual onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
