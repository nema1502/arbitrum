// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EventManager - Gestión de eventos y participación de voluntarios
/// @notice Permite a organizaciones registrar eventos y a voluntarios inscribirse a ellos
contract EventManager {
    uint256 public totalEventos;

    /// @dev Estructura de un evento mejorada según el esquema TypeScript
    struct Evento {
        uint256 id;
        address organizador;
        uint256 recompensaPorVoluntario;
        string title;
        string description;
        string longDescription;
        string imageUrl;
        string logoUrl;
        string date;
        string location;
        string category;
    }

    /// @dev Estructura para almacenar información de voluntarios
    struct DatosVoluntario {
        string nombre;
        string email;
        string telefono;
        address direccion;
        bool aprobado; // Indica si el voluntario ha sido aprobado (validado su asistencia)
    }

    /// @dev Mapping de id => Evento
    mapping(uint256 => Evento) public eventos;

    /// @dev Mapping de eventoId => (voluntario => estáInscrito)
    mapping(uint256 => mapping(address => bool)) public inscritos;

    /// @dev Mapping de eventoId => (voluntario => datos)
    mapping(uint256 => mapping(address => DatosVoluntario)) public datosVoluntarios;

    /// @notice Evento creado
    event EventoCreado(
        uint256 indexed id,
        address indexed organizador,
        uint256 recompensa,
        string title,
        string category,
        string date,
        string location
    );

    /// @notice Voluntario inscrito
    event VoluntarioInscrito(
        uint256 indexed eventoId,
        address indexed voluntario,
        string nombre,
        string email,
        string telefono
    );

    /// @notice Crea un nuevo evento con todos los detalles
    /// @param recompensaPorVoluntario Tokens asignados como recompensa por participar
    /// @param title Título del evento
    /// @param description Descripción corta del evento
    /// @param longDescription Descripción detallada del evento
    /// @param imageUrl URL de la imagen principal del evento
    /// @param logoUrl URL del logo del evento
    /// @param date Fecha del evento (formato string)
    /// @param location Ubicación del evento
    /// @param category Categoría del evento
    function crearEvento(
        uint256 recompensaPorVoluntario,
        string memory title,
        string memory description,
        string memory longDescription,
        string memory imageUrl,
        string memory logoUrl,
        string memory date,
        string memory location,
        string memory category
    ) external {
        uint256 eventoId = totalEventos;
        eventos[eventoId] = Evento({
            id: eventoId,
            organizador: msg.sender,
            recompensaPorVoluntario: recompensaPorVoluntario,
            title: title,
            description: description,
            longDescription: longDescription,
            imageUrl: imageUrl,
            logoUrl: logoUrl,
            date: date,
            location: location,
            category: category
        });

        totalEventos++;

        emit EventoCreado(eventoId, msg.sender, recompensaPorVoluntario, title, category, date, location);
    }

    /// @notice Permite a un voluntario inscribirse a un evento
    /// @param eventoId ID del evento
    /// @param nombre Nombre completo del voluntario
    /// @param email Correo electrónico del voluntario
    /// @param telefono Número telefónico del voluntario
    function inscribirseAEvento(
        uint256 eventoId,
        string memory nombre,
        string memory email,
        string memory telefono
    ) external {
        require(eventoId < totalEventos, "Evento no existe");
        require(!inscritos[eventoId][msg.sender], "Ya estas inscrito");

        // Almacenar los datos del voluntario
        datosVoluntarios[eventoId][msg.sender] = DatosVoluntario({
            nombre: nombre,
            email: email,
            telefono: telefono,
            direccion: msg.sender,
            aprobado: false // Por defecto, el voluntario no está aprobado
        });

        inscritos[eventoId][msg.sender] = true;

        // Añadir la dirección al array de voluntarios de este evento
        voluntariosPorEvento[eventoId].push(msg.sender);

        emit VoluntarioInscrito(eventoId, msg.sender, nombre, email, telefono);
    }

    /// @notice Devuelve todos los eventos registrados
    /// @return Array de structs Evento
    function obtenerTodosLosEventos() external view returns (Evento[] memory) {
        Evento[] memory lista = new Evento[](totalEventos);
        for (uint256 i = 0; i < totalEventos; i++) {
            lista[i] = eventos[i];
        }
        return lista;
    }

    /// @notice Buscar eventos por categoría
    /// @param _category Categoría a buscar
    /// @return Array de structs Evento que coinciden con la categoría
    function buscarEventosPorCategoria(string memory _category) external view returns (Evento[] memory) {
        // Primero contamos cuántos eventos coinciden
        uint256 contador = 0;
        for (uint256 i = 0; i < totalEventos; i++) {
            // Comparamos strings mediante hash para eficiencia en gas
            if (keccak256(bytes(eventos[i].category)) == keccak256(bytes(_category))) {
                contador++;
            }
        }

        // Creamos el array de resultados
        Evento[] memory resultado = new Evento[](contador);

        // Llenamos el array con los eventos que coinciden
        uint256 indice = 0;
        for (uint256 i = 0; i < totalEventos; i++) {
            if (keccak256(bytes(eventos[i].category)) == keccak256(bytes(_category))) {
                resultado[indice] = eventos[i];
                indice++;
            }
        }

        return resultado;
    }

    /// @notice Verificar si un usuario está inscrito en un evento
    /// @param eventoId ID del evento
    /// @param voluntario Dirección del voluntario
    /// @return bool Verdadero si está inscrito, falso en caso contrario
    function estaInscrito(uint256 eventoId, address voluntario) external view returns (bool) {
        require(eventoId < totalEventos, "Evento no existe");
        return inscritos[eventoId][voluntario];
    }

    /// @notice Actualizar datos de un evento
    /// @dev Solo el organizador puede actualizar su evento
    function actualizarEvento(
        uint256 eventoId,
        string memory title,
        string memory description,
        string memory longDescription,
        string memory imageUrl,
        string memory logoUrl,
        string memory date,
        string memory location,
        string memory category
    ) external {
        require(eventoId < totalEventos, "Evento no existe");
        require(msg.sender == eventos[eventoId].organizador, "No eres el organizador");

        Evento storage evento = eventos[eventoId];
        evento.title = title;
        evento.description = description;
        evento.longDescription = longDescription;
        evento.imageUrl = imageUrl;
        evento.logoUrl = logoUrl;
        evento.date = date;
        evento.location = location;
        evento.category = category;
    }

    function obtenerDatosEvento(
        uint256 eventoId
    ) external view returns (address organizador, uint256 recompensaPorVoluntario) {
        require(eventoId < totalEventos, "Evento no existe");
        Evento storage evento = eventos[eventoId];
        return (evento.organizador, evento.recompensaPorVoluntario);
    }

    /// @notice Obtener información de un voluntario inscrito en un evento
    /// @param eventoId ID del evento
    /// @param voluntario Dirección del voluntario
    /// @return Estructura con los datos del voluntario
    function obtenerDatosVoluntario(
        uint256 eventoId,
        address voluntario
    ) external view returns (DatosVoluntario memory) {
        require(eventoId < totalEventos, "Evento no existe");
        require(inscritos[eventoId][voluntario], "El voluntario no esta inscrito");

        return datosVoluntarios[eventoId][voluntario];
    }

    /// @dev Mapping para almacenar direcciones de voluntarios inscritos por evento
    mapping(uint256 => address[]) private voluntariosPorEvento;

    /// @notice Obtener todas las direcciones de voluntarios inscritos en un evento
    /// @param eventoId ID del evento
    /// @return Array de direcciones de los voluntarios inscritos
    function obtenerDireccionesVoluntarios(uint256 eventoId) external view returns (address[] memory) {
        require(eventoId < totalEventos, "Evento no existe");
        return voluntariosPorEvento[eventoId];
    }

    /// @notice Obtener todos los voluntarios inscritos en un evento específico
    /// @param eventoId ID del evento
    /// @return Array de structs DatosVoluntario con la información de todos los voluntarios
    function obtenerTodosLosVoluntarios(uint256 eventoId) external view returns (DatosVoluntario[] memory) {
        require(eventoId < totalEventos, "Evento no existe");

        // Obtenemos el array de direcciones para este evento
        address[] storage direccionesInscritas = voluntariosPorEvento[eventoId];
        uint256 totalVoluntarios = direccionesInscritas.length;

        // Creamos el array de resultados con el tamaño exacto
        DatosVoluntario[] memory voluntariosInscritos = new DatosVoluntario[](totalVoluntarios);

        // Llenamos el array con los datos de cada voluntario
        for (uint256 i = 0; i < totalVoluntarios; i++) {
            voluntariosInscritos[i] = datosVoluntarios[eventoId][direccionesInscritas[i]];
        }

        return voluntariosInscritos;
    }

    /// @notice Evento emitido cuando un voluntario es aprobado
    event VoluntarioAprobado(uint256 indexed eventoId, address indexed voluntario);

    /// @notice Marca un voluntario como aprobado (asistencia validada)
    /// @dev Solo el organizador del evento puede aprobar voluntarios
    /// @param eventoId ID del evento
    /// @param voluntario Dirección del voluntario a aprobar
    function aprobarVoluntario(uint256 eventoId, address voluntario, address solicitante) external {
        require(eventoId < totalEventos, "Evento no existe");
        require(inscritos[eventoId][voluntario], "El voluntario no esta inscrito");
        require(solicitante == eventos[eventoId].organizador, "No eres el organizador");

        datosVoluntarios[eventoId][voluntario].aprobado = true;
    }
}
