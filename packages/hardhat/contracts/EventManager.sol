// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EventManager - Gestión de eventos y participación de voluntarios
/// @notice Permite a organizaciones registrar eventos y a voluntarios inscribirse a ellos
contract EventManager {
    uint256 public totalEventos;

    /// @dev Estructura de un evento
    struct Evento {
        uint256 id;
        address organizador;
        uint256 recompensaPorVoluntario;
        string infoEventoURI;
    }

    /// @dev Mapping de id => Evento
    mapping(uint256 => Evento) public eventos;

    /// @dev Mapping de eventoId => (voluntario => estáInscrito)
    mapping(uint256 => mapping(address => bool)) public inscritos;

    /// @notice Evento creado
    event EventoCreado(uint256 indexed id, address indexed organizador, uint256 recompensa, string infoEventoURI);

    /// @notice Voluntario inscrito
    event VoluntarioInscrito(uint256 indexed eventoId, address indexed voluntario);

    /// @notice Crea un nuevo evento
    /// @param recompensaPorVoluntario Tokens asignados como recompensa por participar
    /// @param infoEventoURI URI con información descriptiva (IPFS, Arweave, etc.)
    function crearEvento(uint256 recompensaPorVoluntario, string memory infoEventoURI) external {
        uint256 eventoId = totalEventos;
        eventos[eventoId] = Evento({
            id: eventoId,
            organizador: msg.sender,
            recompensaPorVoluntario: recompensaPorVoluntario,
            infoEventoURI: infoEventoURI
        });

        totalEventos++;

        emit EventoCreado(eventoId, msg.sender, recompensaPorVoluntario, infoEventoURI);
    }

    /// @notice Permite a un voluntario inscribirse a un evento
    /// @param eventoId ID del evento
    function inscribirseAEvento(uint256 eventoId) external {
        require(eventoId < totalEventos, "Evento no existe");
        require(!inscritos[eventoId][msg.sender], "Ya estas inscrito");

        inscritos[eventoId][msg.sender] = true;

        emit VoluntarioInscrito(eventoId, msg.sender);
    }
}
