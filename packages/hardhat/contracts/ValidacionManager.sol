// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVoluntarioToken {
    function mint(address to, uint256 amount) external;
}

interface IEventManager {
    struct Evento {
        uint256 id;
        address organizador;
        uint256 recompensaPorVoluntario;
        string infoEventoURI;
    }
    function eventos(uint256 eventoId) external view returns (Evento memory);
}

contract ValidacionManager {
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
        IEventManager.Evento memory evento = eventManager.eventos(_eventoId);
        require(msg.sender == evento.organizador, "No eres el organizador");
        require(_voluntario != address(0), "Direccion invalida");

        uint256 recompensa = evento.recompensaPorVoluntario;
        voluntarioToken.mint(_voluntario, recompensa);
    }

    /**
     * @notice Valida la asistencia de MÚLTIPLES voluntarios. Eficiente en gas para producción.
     * @param _eventoId El ID del evento.
     * @param _voluntarios Un array de direcciones de los voluntarios que asistieron.
     */
    function validarAsistenciaMultiple(uint256 _eventoId, address[] calldata _voluntarios) public {
        IEventManager.Evento memory evento = eventManager.eventos(_eventoId);
        require(msg.sender == evento.organizador, "No eres el organizador");

        uint256 recompensa = evento.recompensaPorVoluntario;
        for (uint i = 0; i < _voluntarios.length; i++) {
            if (_voluntarios[i] != address(0)) {
                voluntarioToken.mint(_voluntarios[i], recompensa);
            }
        }
    }
}
