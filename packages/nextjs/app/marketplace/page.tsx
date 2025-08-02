"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { ResponsiveGrid } from "~~/components/ResponsiveGrid";

// Mock rewards data
const MOCK_REWARDS = [
  {
    id: 1,
    title: "Curso de Blockchain Avanzado",
    description: "Aprende tecnología blockchain, smart contracts y desarrollo en Ethereum y Arbitrum.",
    imageUrl: "https://placehold.co/600x400/3b82f6/ffffff?text=Blockchain+Avanzado",
    provider: "Tech Academy",
    tokenCost: 500,
    category: "Cursos",
  },
  {
    id: 2,
    title: "Mentoría Desarrollo Web3",
    description: "Sesiones uno a uno con expertos en desarrollo Web3 para impulsar tu carrera.",
    imageUrl: "https://placehold.co/600x400/10b981/ffffff?text=Mentoria+Web3",
    provider: "Dev Mentors",
    tokenCost: 800,
    category: "Mentorías",
  },
  {
    id: 3,
    title: "Auditoría de Smart Contracts",
    description: "Servicio profesional de auditoría para tus contratos inteligentes.",
    imageUrl: "https://placehold.co/600x400/ef4444/ffffff?text=Auditoria+Contratos",
    provider: "Secure Chain",
    tokenCost: 1200,
    category: "Servicios",
  },
  {
    id: 4,
    title: "Libro: El Futuro de Web3",
    description: "Libro digital sobre las tendencias y el futuro de la tecnología Web3.",
    imageUrl: "https://placehold.co/600x400/f59e0b/ffffff?text=Libro+Web3",
    provider: "Crypto Press",
    tokenCost: 150,
    category: "Productos",
  },
  {
    id: 5,
    title: "NFT Exclusivo de Comunidad",
    description: "NFT de edición limitada para miembros de la comunidad.",
    imageUrl: "https://placehold.co/600x400/8b5cf6/ffffff?text=NFT+Exclusivo",
    provider: "Community Art",
    tokenCost: 350,
    category: "Productos",
  },
  {
    id: 6,
    title: "Curso de Desarrollo DeFi",
    description: "Aprende a construir aplicaciones financieras descentralizadas desde cero.",
    imageUrl: "https://placehold.co/600x400/ec4899/ffffff?text=Curso+DeFi",
    provider: "DeFi School",
    tokenCost: 600,
    category: "Cursos",
  },
  {
    id: 7,
    title: "Sesión de Networking Premium",
    description: "Acceso a evento exclusivo de networking con líderes de la industria.",
    imageUrl: "https://placehold.co/600x400/14b8a6/ffffff?text=Networking+Premium",
    provider: "Industry Connect",
    tokenCost: 400,
    category: "Servicios",
  },
  {
    id: 8,
    title: "Consultoría de Tokenomics",
    description: "Asesoría personalizada para diseñar la economía de tu token o proyecto.",
    imageUrl: "https://placehold.co/600x400/6366f1/ffffff?text=Consultoria+Tokenomics",
    provider: "Token Experts",
    tokenCost: 950,
    category: "Mentorías",
  },
];

// All categories for filters
const ALL_CATEGORIES = ["Todos", ...new Set(MOCK_REWARDS.map(reward => reward.category))];

const Marketplace: NextPage = () => {
  // const { address: connectedAddress } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filteredRewards, setFilteredRewards] = useState(MOCK_REWARDS);
  const [userTokens] = useState(1500); // Mock user tokens

  // Filter rewards based on selected category
  useEffect(() => {
    if (selectedCategory === "Todos") {
      setFilteredRewards(MOCK_REWARDS);
    } else {
      setFilteredRewards(MOCK_REWARDS.filter(reward => reward.category === selectedCategory));
    }
  }, [selectedCategory]);

  return (
    <div className="flex flex-col w-full items-center justify-center px-4 py-8">
      <div className="w-full flex max-w-screen-2xl flex-col items-center justify-center">
        {/* Header section */}
        <div className="flex flex-col w-full text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Marketplace de Recompensas</h1>
          <p className="text-lg">Canjea tus tokens de voluntariado por cursos, mentorías, servicios y productos</p>
        </div>
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {ALL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`btn ${selectedCategory === category ? "btn-primary" : "btn-outline"}`}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Rewards grid */}
        <ResponsiveGrid>
          {filteredRewards.map(reward => (
            <div key={reward.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <figure className="h-48 relative">
                <Image src={reward.imageUrl} unoptimized alt={reward.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 badge badge-primary p-3">{reward.tokenCost} Tokens</div>
              </figure>
              <div className="card-body">
                <h3 className="card-title">{reward.title}</h3>
                <p className="text-sm text-gray-500 mt-0 mb-1">por {reward.provider}</p>
                <p className="line-clamp-2 mt-1 text-sm mb-4">{reward.description}</p>
                <div className="card-actions justify-between items-center">
                  <div className="badge badge-outline">{reward.category}</div>
                  <button
                    className={`btn btn-primary btn-sm ${userTokens < reward.tokenCost ? "btn-disabled" : ""}`}
                    disabled={userTokens < reward.tokenCost}
                  >
                    {userTokens < reward.tokenCost ? "Tokens insuficientes" : "Canjear"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </ResponsiveGrid>
        {/* Empty state */}
        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No hay recompensas en esta categoría</h3>
            <p>Por favor, intenta seleccionar otra categoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
