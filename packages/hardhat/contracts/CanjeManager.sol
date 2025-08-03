// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title CanjeManager - Gestión de recompensas para el marketplace
/// @notice Permite a organizaciones crear recompensas y a voluntarios canjearlas usando tokens
contract CanjeManager {
    /// @dev Estructura de una recompensa mejorada según el esquema TypeScript en RewardType
    struct Recompensa {
        uint256 id;
        address creador;
        string title;
        string description;
        string imageUrl;
        string provider;
        uint256 tokenCost;
        string category;
        bool activa;
    }

    IERC20 public voluntarioToken;
    uint256 public totalRecompensas;
    mapping(uint256 => Recompensa) public recompensas;

    /// @notice Evento emitido cuando se crea una nueva recompensa
    event RecompensaCreada(
        uint256 indexed id,
        address indexed creador,
        string title,
        uint256 tokenCost,
        string category
    );

    /// @notice Evento emitido cuando se canjea una recompensa
    event RecompensaCanjeada(address indexed comprador, uint256 indexed recompensaId);

    constructor(address _tokenAddress) {
        voluntarioToken = IERC20(_tokenAddress);
    }

    /// @notice Crea una nueva recompensa en el marketplace
    /// @param tokenCost Cantidad de tokens necesarios para canjear la recompensa
    /// @param title Título de la recompensa
    /// @param description Descripción corta de la recompensa
    /// @param imageUrl URL de la imagen de la recompensa
    /// @param provider Nombre del proveedor de la recompensa
    /// @param category Categoría de la recompensa
    function crearRecompensa(
        uint256 tokenCost,
        string memory title,
        string memory description,
        string memory imageUrl,
        string memory provider,
        string memory category
    ) external {
        uint256 recompensaId = totalRecompensas;

        recompensas[recompensaId] = Recompensa({
            id: recompensaId,
            creador: msg.sender,
            title: title,
            description: description,
            imageUrl: imageUrl,
            provider: provider,
            tokenCost: tokenCost,
            category: category,
            activa: true
        });

        totalRecompensas++;

        emit RecompensaCreada(recompensaId, msg.sender, title, tokenCost, category);
    }

    function canjearRecompensa(uint256 _recompensaId) external {
        Recompensa memory recompensa = recompensas[_recompensaId];
        require(recompensa.activa, "La recompensa no esta activa");

        uint256 costo = recompensa.tokenCost;
        address comprador = msg.sender;

        // El contrato debe tener permiso (allowance) para gastar los tokens del usuario.
        // El usuario debe llamar a `approve()` en el contrato del token primero.
        require(voluntarioToken.balanceOf(comprador) >= costo, "No tienes suficientes tokens");

        // Transfiere los tokens del usuario a este contrato, para luego quemarlos o enviarlos a tesorería.
        bool success = voluntarioToken.transferFrom(comprador, address(this), costo);
        require(success, "Transferencia de tokens fallida");

        emit RecompensaCanjeada(comprador, _recompensaId);
    }

    /// @notice Obtener detalles de una recompensa específica
    /// @param recompensaId ID de la recompensa
    /// @return Estructura Recompensa con los datos completos
    function obtenerRecompensa(uint256 recompensaId) external view returns (Recompensa memory) {
        require(recompensaId < totalRecompensas, "Recompensa no existe");
        return recompensas[recompensaId];
    }

    /// @notice Actualizar estado de una recompensa (activar/desactivar)
    /// @dev Solo el creador puede cambiar el estado de su recompensa
    /// @param recompensaId ID de la recompensa
    /// @param nuevoEstado Nuevo estado de activación
    function cambiarEstadoRecompensa(uint256 recompensaId, bool nuevoEstado) external {
        require(recompensaId < totalRecompensas, "Recompensa no existe");
        require(msg.sender == recompensas[recompensaId].creador, "No eres el creador");

        recompensas[recompensaId].activa = nuevoEstado;
    }

    /// @notice Devuelve todas las recompensas registradas
    /// @return Array de structs Recompensa
    function obtenerTodasLasRecompensas() external view returns (Recompensa[] memory) {
        Recompensa[] memory lista = new Recompensa[](totalRecompensas);
        for (uint256 i = 0; i < totalRecompensas; i++) {
            lista[i] = recompensas[i];
        }
        return lista;
    }
}
