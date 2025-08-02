// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CanjeManager {
    struct Recompensa {
        uint256 id;
        address creador;
        uint256 costo;
        string metadataURI;
        bool activa;
    }

    IERC20 public voluntarioToken;
    uint256 public nextRecompensaId;
    mapping(uint256 => Recompensa) public recompensas;

    event RecompensaCanjeada(address indexed comprador, uint256 indexed recompensaId);

    constructor(address _tokenAddress) {
        voluntarioToken = IERC20(_tokenAddress);
    }

    function crearRecompensa(uint256 _costo, string memory _metadataURI) public {
        recompensas[nextRecompensaId] = Recompensa({
            id: nextRecompensaId,
            creador: msg.sender,
            costo: _costo,
            metadataURI: _metadataURI,
            activa: true
        });
        nextRecompensaId++;
    }

    function canjearRecompensa(uint256 _recompensaId) public {
        Recompensa memory recompensa = recompensas[_recompensaId];
        require(recompensa.activa, "La recompensa no esta activa");

        uint256 costo = recompensa.costo;
        address comprador = msg.sender;

        // El contrato debe tener permiso (allowance) para gastar los tokens del usuario.
        // El usuario debe llamar a `approve()` en el contrato del token primero.
        require(voluntarioToken.balanceOf(comprador) >= costo, "No tienes suficientes tokens");

        // Transfiere los tokens del usuario a este contrato, para luego quemarlos o enviarlos a tesorería.
        bool success = voluntarioToken.transferFrom(comprador, address(this), costo);
        require(success, "Transferencia de tokens fallida");

        // Aquí podrías quemar los tokens o enviarlos a una tesorería.
        // Por ahora, se quedan en el contrato.

        emit RecompensaCanjeada(comprador, _recompensaId);
    }
}
