"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const CrearEventoPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "EventManager",
  });

  // Lista de categorías predefinidas
  const categories = ["Ambiental", "Educación", "Recaudación de fondos", "Comunitario", "Tecnología", "Salud", "Otro"];

  const randomDefaultCategory = categories[Math.floor(Math.random() * categories.length)];
  // Estado para cada campo del formulario
  const [recompensa, setRecompensa] = useState("100");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://placehold.co/1200x600/3b82f6/ffffff?text=New+Event+Picture");
  const [logoUrl, setLogoUrl] = useState("https://placehold.co/200x200/3b82f6/ffffff?text=Logo");
  const [date, setDate] = useState("2025-12-12");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState(randomDefaultCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      alert("Por favor, conecta tu billetera.");
      return;
    }
    try {
      await writeContractAsync({
        functionName: "crearEvento",
        args: [
          parseEther(recompensa),
          title,
          description,
          longDescription,
          imageUrl,
          logoUrl,
          date,
          location,
          category,
        ],
      });
      // Limpiar el formulario después de enviar
      setRecompensa("100");
      setTitle("");
      setDescription("");
      setLongDescription("");
      setImageUrl("https://placehold.co/1200x600/3b82f6/ffffff?text=New+Event+Picture");
      setLogoUrl("https://placehold.co/200x200/3b82f6/ffffff?text=Logo");
      setDate("2025-12-12");
      setLocation("");
      setCategory(randomDefaultCategory);
    } catch (error) {
      console.error("Error al crear el evento:", error);
      alert("Error al crear el evento. Consulta la consola para más detalles.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Crear Nuevo Evento</h1>
      <div className="max-w-2xl mx-auto p-6 card bg-base-100">
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-lg font-medium mb-2">
              Título del Evento
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Día de Limpieza Comunitaria"
              required
            />
          </div>

          {/* Descripción corta */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-lg font-medium mb-2">
              Descripción Corta
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Breve descripción del evento (máximo 200 caracteres)"
              required
              rows={2}
              maxLength={200}
            ></textarea>
          </div>

          {/* Descripción larga */}
          <div className="mb-4">
            <label htmlFor="longDescription" className="block text-lg font-medium mb-2">
              Descripción Detallada
            </label>
            <textarea
              id="longDescription"
              value={longDescription}
              onChange={e => setLongDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Descripción completa del evento, sus objetivos y lo que los participantes pueden esperar"
              required
              rows={5}
            ></textarea>
          </div>

          {/* URL de la imagen principal */}
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-lg font-medium mb-2">
              URL de Imagen Principal
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="input input-bordered w-full"
              placeholder="https://ejemplo.com/imagen.jpg"
              required
            />
          </div>

          {/* URL del logo */}
          <div className="mb-4">
            <label htmlFor="logoUrl" className="block text-lg font-medium mb-2">
              URL del Logo
            </label>
            <input
              type="url"
              id="logoUrl"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className="input input-bordered w-full"
              placeholder="https://ejemplo.com/logo.jpg"
              required
            />
          </div>

          {/* Fecha */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-lg font-medium mb-2">
              Fecha del Evento
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Ubicación */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-lg font-medium mb-2">
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Parque Central"
              required
            />
          </div>

          {/* Categoría */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-lg font-medium mb-2">
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Recompensa */}
          <div className="mb-6">
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

          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? "Creando..." : "Crear Evento"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearEventoPage;
