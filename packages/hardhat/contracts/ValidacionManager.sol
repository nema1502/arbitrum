// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVoluntarioToken {
    function mint(address to, uint256 amount) external;
}

interface IEventManager {
    function obtenerDatosEvento(
        uint256 eventoId
    ) external view returns (address organizador, uint256 recompensaPorVoluntario);
    function aprobarVoluntario(uint256 eventoId, address voluntario, address solicitante) external;
}

contract ValidacionManager {
    /// @notice Emitted when a single volunteer's attendance is validated
    event AsistenciaUnicaValidada(uint256 indexed eventoId, address indexed voluntario, uint256 recompensa);

    /// @notice Emitted when multiple volunteers' attendance is validated
    event AsistenciaMultipleValidada(uint256 indexed eventoId, address[] voluntarios, uint256 recompensa);
    IVoluntarioToken public voluntarioToken;
    IEventManager public eventManager;

    constructor(address _tokenAddress, address _eventManagerAddress) {
        voluntarioToken = IVoluntarioToken(_tokenAddress);
        eventManager = IEventManager(_eventManagerAddress);
    }

    /**
     * @notice Valida la asistencia de UN SOLO voluntario. Fácil de usar para pruebas y UIs.
     * @param _eventoId El ID del evento.
     * @param _voluntario La dirección del voluntario a validar.
     */
    function validarAsistenciaUnica(uint256 _eventoId, address _voluntario) public {
        (address organizador, uint256 recompensaPorVoluntario) = eventManager.obtenerDatosEvento(_eventoId);
        require(msg.sender == organizador, "No eres el organizador");
        require(_voluntario != address(0), "Direccion invalida");

        voluntarioToken.mint(_voluntario, recompensaPorVoluntario);

        // Marcar al voluntario como aprobado en EventManager
        eventManager.aprobarVoluntario(_eventoId, _voluntario, msg.sender);

        emit AsistenciaUnicaValidada(_eventoId, _voluntario, recompensaPorVoluntario);
    }

    /**
     * @notice Valida la asistencia de MÚLTIPLES voluntarios. Eficiente en gas para producción.
     * @param _eventoId El ID del evento.
     * @param _voluntarios Un array de direcciones de los voluntarios que asistieron.
     */
    function validarAsistenciaMultiple(uint256 _eventoId, address[] calldata _voluntarios) public {
        (address organizador, uint256 recompensaPorVoluntario) = eventManager.obtenerDatosEvento(_eventoId);
        require(msg.sender == organizador, "No eres el organizador");

        for (uint i = 0; i < _voluntarios.length; i++) {
            if (_voluntarios[i] != address(0)) {
                voluntarioToken.mint(_voluntarios[i], recompensaPorVoluntario);
                // Marcar al voluntario como aprobado en EventManager
                eventManager.aprobarVoluntario(_eventoId, _voluntarios[i], msg.sender);
            }
        }

        emit AsistenciaMultipleValidada(_eventoId, _voluntarios, recompensaPorVoluntario);
    }
}
