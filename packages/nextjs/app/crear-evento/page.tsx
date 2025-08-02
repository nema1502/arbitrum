"use client";

import type { NextPage } from "next";
import { CrearEventoForm } from "~~/components/thrive/CrearEventoForm";

const CrearEventoPage: NextPage = () => {
  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Crear un Nuevo Evento</h1>
      <CrearEventoForm />
    </div>
  );
};

export default CrearEventoPage;
