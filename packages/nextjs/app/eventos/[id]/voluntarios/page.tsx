"use client";

import { useParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const VolunteersPage = () => {
  const params = useParams();
  const id = BigInt(params?.id ? params?.id.toString() : "0");

  const solicitarVoluntariosEvento = useScaffoldReadContract({
    contractName: "EventManager",
    functionName: "obtenerTodosLosVoluntarios",
    args: [id],
  });

  const aprobarVoluntario = useScaffoldWriteContract({
    contractName: "ValidacionManager",
  });

  const handleVerify = async (direccion: string) => {
    await aprobarVoluntario.writeContractAsync({
      functionName: "validarAsistenciaUnica",
      args: [id, direccion],
    });
  };

  return (
    <div className="mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Voluntarios de Evento</h1>

      <div className="w-full flex items-center justify-center">
        <div className="max-w-screen-lg w-full overflow-x-auto shadow-lg rounded-lg">
          <table className="table  w-full bg-base-100">
            <thead>
              <tr className="bg-primary text-primary-content">
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitarVoluntariosEvento.data?.map((voluntario, index) => (
                <tr key={index} className="hover">
                  <td>{voluntario.nombre}</td>
                  <td>{voluntario.email}</td>
                  <td>{voluntario.telefono}</td>
                  <td className="font-mono text-sm">{voluntario.direccion.toString()}</td>
                  <td>
                    {!voluntario.aprobado ? (
                      <button onClick={() => handleVerify(voluntario.direccion)} className="btn btn-sm btn-primary">
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Aprobar participación
                      </button>
                    ) : (
                      <span className="text-green-800">Participación aprobada</span>
                    )}
                  </td>
                </tr>
              ))}
              {!solicitarVoluntariosEvento.data?.length && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {solicitarVoluntariosEvento.isLoading && "Cargando..."}
                    {!solicitarVoluntariosEvento.isLoading && "No hay voluntarios registrados para este evento"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VolunteersPage;
