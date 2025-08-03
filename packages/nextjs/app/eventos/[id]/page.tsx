"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { CalendarIcon, MapPinIcon, TicketIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { EventType } from "~~/app/page";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getDefaultEventData, parseEventoData } from "~~/utils/evento-parser";

const EventProfilePage = () => {
  const params = useParams();
  const id = params?.id;

  const { address: connectedAddress } = useAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(connectedAddress ?? "");
  const [eventData, setEventData] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Contract read hook
  const { data: evento } = useScaffoldReadContract({
    contractName: "EventManager",
    functionName: "eventos",
    args: [BigInt(id ? id.toString() : "0")],
  });

  // Contract write hook
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "EventManager",
  });

  // Manejar el envío del formulario de voluntariado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro de voluntario:", { name, email, phone });

    try {
      await writeContractAsync({
        functionName: "inscribirseAEvento",
        args: [BigInt(id ? id.toString() : "0"), name, email, phone],
      });
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
    } catch (error) {
      console.error("Error al inscribirse:", error);
    }
  };

  useEffect(() => {
    if (id && evento) {
      try {
        setEventData(parseEventoData(evento));
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing event data:", error);
        // Fallback to mock data
        setEventData(getDefaultEventData(id.toString()));
        setIsLoading(false);
      }
    }
  }, [id, evento]);

  if (isLoading || !eventData) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex isolate flex-col items-center">
      {/* Banner Image Section */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <Image
          src={eventData.imageUrl}
          alt={eventData.title}
          fill
          unoptimized
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-4xl px-4 py-8 z-10 -mt-16 relative">
        {/* Descripción corta */}
        <div className="bg-base-100 p-6 rounded-lg shadow-xl mb-8">
          <h1 className="text-3xl font-bold mb-4">{eventData.title}</h1>
          <p className="text-lg">{eventData.longDescription}</p>
        </div>

        {/* Tarjeta de evento con detalles */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo e información básica */}
              <div className="md:w-1/3 flex items-center">
                <div className="relative h-48 w-48 mx-auto">
                  <Image
                    src={eventData.logoUrl}
                    alt={`Logo de ${eventData.title}`}
                    fill
                    unoptimized
                    className="object-cover rounded-md"
                  />
                </div>
              </div>

              {/* Detalles del evento */}
              <div className="md:w-2/3">
                <h2 className="card-title text-2xl mb-4">{eventData.title}</h2>
                <div className="badge badge-secondary mb-4">{eventData.category}</div>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{new Date(eventData.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{eventData.location}</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>Recompensa: {eventData.recompensa} VOL</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => document.getElementById("inscripcion-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <TicketIcon className="h-5 w-5 mr-2" />
                  Participar
                </button>

                <Link href={`/eventos/${id}/voluntarios`} className="btn btn-secondary ml-2">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Participantes
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de inscripción de voluntarios */}
        <div id="inscripcion-form" className="bg-base-100 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Inscripción de Voluntarios</h2>
          <p className="mb-4">
            ¿Te interesa ser voluntario para este evento? ¡Completa el siguiente formulario para inscribirte!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="name" className="block text-lg font-medium mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ingresa tu nombre completo"
              required
            />

            <label className="block text-lg font-medium mb-2">Correo electrónico</label>
            <input
              type="email"
              className="input input-bordered"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
            <label className="block text-lg font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              className="input input-bordered"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+34 123 456 789"
              required
            />

            <label className="block text-lg font-medium mb-2">Dirección de wallet</label>
            <AddressInput onChange={setAddress} value={address} placeholder="Tu dirección de wallet" />
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? "Inscribiendo..." : "Inscribirse como voluntario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventProfilePage;
