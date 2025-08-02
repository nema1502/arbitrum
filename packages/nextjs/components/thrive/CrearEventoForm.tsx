"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const CrearEventoForm = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("EventManager");

  const [recompensa, setRecompensa] = useState("");
  const [infoURI, setInfoURI] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      alert("Por favor, conecta tu billetera.");
      return;
    }
    try {
      await writeContractAsync({
        functionName: "crearEvento",
        args: [parseEther(recompensa), infoURI],
      });
      setRecompensa("");
      setInfoURI("");
    } catch (error) {
      console.error("Error al crear el evento:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-base-200 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="recompensa" className="block text-lg font-medium mb-2">
            Recompensa por Voluntario (en tokens VOL)
          </label>
          <input
            type="number"
            id="recompensa"
            value={recompensa}
            onChange={e => setRecompensa(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Ej: 100"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="infoURI" className="block text-lg font-medium mb-2">
            Descripción / URI de Información
          </label>
          <textarea
            id="infoURI"
            value={infoURI}
            onChange={e => setInfoURI(e.target.value)}
            className="textarea textarea-bordered w-full"
            placeholder="Describe brevemente el evento. En el futuro esto será una URI de IPFS."
            required
            rows={4}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? "Creando..." : "Crear Evento"}
        </button>
      </form>
    </div>
  );
};
