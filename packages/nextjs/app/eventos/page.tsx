"use client";

import type { NextPage } from "next";
import { EventoCard } from "~~/components/thrive/EventoCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Eventos: NextPage = () => {
  // Obtenemos el estado de carga (isLoading) para una mejor UX
  const { data: totalEventos, isLoading } = useScaffoldReadContract({
    contractName: "EventManager",
    functionName: "totalEventos",
    watch: true, // Se actualiza automáticamente si cambia
  });

  // Muestra un mensaje mientras los datos se cargan
  if (isLoading) {
    return <div className="text-center mt-10">Cargando eventos...</div>;
  }

  // Muestra un mensaje si no hay eventos
  if (!totalEventos || totalEventos === 0n) {
    return <div className="text-center mt-10">Aún no hay eventos. ¡Crea uno!</div>;
  }

  const eventosIds = [];
  for (let i = 0n; i < totalEventos; i++) {
    eventosIds.push(i);
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Eventos de Voluntariado</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventosIds.map(id => (
          <EventoCard key={id.toString()} eventId={id} />
        ))}
      </div>
    </div>
  );
};

export default Eventos;
