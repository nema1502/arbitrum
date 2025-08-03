"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CalendarIcon, MapPinIcon, TicketIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { EventType } from "~~/app/page";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Datos de evento de ejemplo para desarrollo de UI
const MOCK_EVENT: EventType = {
  id: 1,
  title: "Día de Limpieza Comunitaria",
  description: "Únete a nosotros para un día de limpieza en el parque local.",
  longDescription:
    "Este día de limpieza comunitaria tiene como objetivo reunir a voluntarios de todos los ámbitos " +
    "para ayudar a restaurar la belleza de nuestro parque local. Recogeremos basura, plantaremos nuevas flores " +
    "y repararemos los equipos del parque infantil. Es una gran oportunidad para conocer a tus vecinos, " +
    "aprender sobre conservación ambiental y marcar una diferencia tangible en nuestra comunidad. " +
    "Se proporcionarán todos los materiales de limpieza, pero si lo prefieres, puedes traer tus propios guantes y botella de agua. " +
    "El evento concluirá con un pequeño picnic para todos los voluntarios.",
  imageUrl: "https://placehold.co/1200x600/3b82f6/ffffff?text=Día+de+Limpieza+Comunitaria",
  logoUrl: "https://placehold.co/200x200/3b82f6/ffffff?text=Logo",
  date: "2025-08-15",
  location: "Parque Central",
  attendees: 45,
  category: "Ambiental",
};

const EventProfilePage = () => {
  const params = useParams();
  const id = params?.id;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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
        args: [BigInt(id ? id.toString() : "0")],
      });
      alert("¡Te has inscrito exitosamente al evento!");
      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      console.error("Error al inscribirse:", error);
      alert("Hubo un error al inscribirte. Por favor, intenta de nuevo.");
    }
  };

  useEffect(() => {
    if (id) {
      console.log("Event ID:", id);
      console.log("Event data:", evento);
    }
  }, [id, evento]);

  return (
    <div className="flex isolate flex-col items-center">
      {/* Banner Image Section */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <Image
          src={MOCK_EVENT.imageUrl}
          alt={MOCK_EVENT.title}
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
          <h1 className="text-3xl font-bold mb-4">{MOCK_EVENT.title}</h1>
          <p className="text-lg">{MOCK_EVENT.longDescription}</p>
        </div>

        {/* Tarjeta de evento con detalles */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo e información básica */}
              <div className="md:w-1/3">
                <div className="relative h-48 w-48 mx-auto">
                  <Image
                    src={MOCK_EVENT.logoUrl}
                    alt={`Logo de ${MOCK_EVENT.title}`}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Detalles del evento */}
              <div className="md:w-2/3">
                <h2 className="card-title text-2xl mb-4">{MOCK_EVENT.title}</h2>
                <div className="badge badge-secondary mb-4">{MOCK_EVENT.category}</div>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{new Date(MOCK_EVENT.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{MOCK_EVENT.location}</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>{MOCK_EVENT.attendees} participantes</span>
                  </div>
                </div>

                <button className="btn btn-primary">
                  <TicketIcon className="h-5 w-5 mr-2" />
                  Comprar entradas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de inscripción de voluntarios */}
        <div className="bg-base-100 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Inscripción de Voluntarios</h2>
          <p className="mb-4">
            ¿Te interesa ser voluntario para este evento? ¡Completa el siguiente formulario para inscribirte!
          </p>

          <form onSubmit={handleSubmit} className="">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Nombre completo</legend>
              <input
                type="text"
                className="input input-bordered"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Correo electrónico</legend>
              <input
                type="email"
                className="input input-bordered"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Teléfono</legend>
              <input
                type="tel"
                className="input input-bordered"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Dirección de Wallet</legend>
              <AddressInput onChange={setAddress} value={address} placeholder="Ingresa tu dirección" />
            </fieldset>
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
