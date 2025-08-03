import { formatEther } from "viem";
import { EventType } from "~~/app/page";

/**
 * Convierte los datos del evento desde el formato de contrato al tipo EventType
 * @param eventoData Datos del evento desde el contrato
 * @returns EventType objeto parseado
 */
export const parseEventoData = (eventoData: any): EventType => {
  return {
    id: Number(eventoData[0]),
    organizador: eventoData[1],
    recompensa: formatEther(eventoData[2]),
    title: eventoData[3],
    description: eventoData[4],
    longDescription: eventoData[5],
    imageUrl: eventoData[6],
    logoUrl: eventoData[7],
    date: eventoData[8],
    location: eventoData[9],
    category: eventoData[10],
  };
};

/**
 * Genera datos de evento por defecto en caso de error
 * @param id ID del evento
 * @returns EventType con datos por defecto
 */
export const getDefaultEventData = (id: string | number): EventType => {
  return {
    id: Number(id),
    title: "Evento (Error)",
    description: "No se pudieron cargar los detalles del evento",
    longDescription: "Hubo un error al cargar los detalles completos del evento.",
    imageUrl: "https://placehold.co/1200x600/ff0000/ffffff?text=Error",
    logoUrl: "https://placehold.co/200x200/ff0000/ffffff?text=Error",
    date: new Date().toISOString().split("T")[0],
    location: "Desconocida",
    category: "Desconocida",
  };
};
