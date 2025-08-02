"use client";

import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type EventoCardProps = {
  eventId: bigint;
};

export const EventoCard = ({ eventId }: EventoCardProps) => {
  const { writeContractAsync, isPending } = useScaffoldWriteContract("EventManager");

  const { data: evento } = useScaffoldReadContract({
    contractName: "EventManager",
    functionName: "eventos",
    args: [eventId],
  });

  const handleInscribirse = async () => {
    try {
      await writeContractAsync({
        functionName: "inscribirseAEvento",
        args: [eventId],
      });
    } catch (error) {
      console.error("Error al inscribirse al evento:", error);
    }
  };

  // La struct de Solidity se devuelve como un array.
  // Accedemos a los datos por su índice:
  // evento[0]: id (bigint)
  // evento[1]: organizador (address)
  // evento[2]: recompensaPorVoluntario (bigint)
  // evento[3]: infoEventoURI (string)

  if (!evento) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 shadow-md bg-base-200 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-2">Evento #{evento[0].toString()}</h2>
        <p className="mb-1">
          <strong>Organizador:</strong> <Address address={evento[1]} />
        </p>
        <p className="mb-1">
          <strong>Recompensa:</strong> {formatEther(evento[2])} VOL
        </p>
        <p className="mb-4">
          <strong>Info:</strong>{" "}
          <a
            href={evento[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {evento[3]}
          </a>
        </p>
      </div>
      <button className="btn btn-primary w-full mt-4" onClick={handleInscribirse} disabled={isPending}>
        {isPending ? "Inscribiendo..." : "Inscribirse"}
      </button>
    </div>
  );
};
