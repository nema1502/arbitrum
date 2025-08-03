"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const CrearPremioPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "CanjeManager",
  });

  // Lista de categorías predefinidas para las recompensas
  const categories = ["Cursos", "Mentorías", "Servicios", "Productos", "Experiencias", "Certificaciones", "Otro"];

  // Estado para cada campo del formulario
  const [tokenCost, setTokenCost] = useState("100");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://placehold.co/600x400/3b82f6/ffffff?text=Recompensa");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState(categories[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      alert("Por favor, conecta tu billetera.");
      return;
    }
    try {
      await writeContractAsync({
        functionName: "crearRecompensa",
        args: [parseEther(tokenCost), title, description, imageUrl, provider, category],
      });
      // Limpiar el formulario después de enviar
      setTokenCost("100");
      setTitle("");
      setDescription("");
      setImageUrl("https://placehold.co/600x400/3b82f6/ffffff?text=Recompensa");
      setProvider("");
      setCategory(categories[0]);
      alert("¡Recompensa creada con éxito!");
    } catch (error) {
      console.error("Error al crear la recompensa:", error);
      alert("Error al crear la recompensa. Consulta la consola para más detalles.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center">Crear Nuevo Recurso</h1>
      <p className="text-center  mb-8 ">Los recursos pueden ser canjeados por los voluntarios.</p>
      <div className="max-w-2xl mx-auto p-6 card bg-base-100">
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-lg font-medium mb-2">
              Título del Recurso
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Curso de Blockchain Avanzado"
              required
            />
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-lg font-medium mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Descripción detallada de la recompensa (máximo 200 caracteres)"
              required
              rows={3}
              maxLength={200}
            ></textarea>
          </div>

          {/* URL de la imagen */}
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-lg font-medium mb-2">
              URL de la Imagen
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

          {/* Proveedor */}
          <div className="mb-4">
            <label htmlFor="provider" className="block text-lg font-medium mb-2">
              Proveedor
            </label>
            <input
              type="text"
              id="provider"
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: Tech Academy"
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

          {/* Costo en Tokens */}
          <div className="mb-6">
            <label htmlFor="tokenCost" className="block text-lg font-medium mb-2">
              Costo en Tokens VOL
            </label>
            <input
              type="number"
              id="tokenCost"
              value={tokenCost}
              onChange={e => setTokenCost(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: 100"
              required
              min="1"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? "Creando..." : "Crear Recompensa"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearPremioPage;
