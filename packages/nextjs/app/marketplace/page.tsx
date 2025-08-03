"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ResponsiveGrid } from "~~/components/ResponsiveGrid";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

// Custom hook to get CanjeManager contract address
const useCanjeManagerAddress = () => {
  const { targetNetwork } = useTargetNetwork();

  const canjeManagerAddress = targetNetwork?.id
    ? deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.CanjeManager?.address
    : undefined;

  return canjeManagerAddress;
};

export type RewardType = {
  id: bigint;
  creador: string;
  title: string;
  description: string;
  imageUrl: string;
  provider: string;
  tokenCost: bigint;
  category: string;
  activa: boolean;
};

const Marketplace: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filteredRewards, setFilteredRewards] = useState<RewardType[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [redeemingId, setRedeemingId] = useState<bigint | null>(null);
  const [approvingId, setApprovingId] = useState<bigint | null>(null);

  // Get CanjeManager contract address dynamically
  const canjeManagerAddress = useCanjeManagerAddress();

  // Get user's VOL token balance
  const { data: userTokenBalance, isLoading: isLoadingBalance } = useScaffoldReadContract({
    contractName: "VoluntarioToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: recompensas, isLoading } = useScaffoldReadContract({
    contractName: "CanjeManager",
    functionName: "obtenerTodasLasRecompensas",
  });

  // Write contract hook for canjearRecompensa function
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "CanjeManager",
  });

  // Write contract hook for VoluntarioToken approve function
  const { writeContractAsync: approveTokens } = useScaffoldWriteContract({
    contractName: "VoluntarioToken",
  });

  // Check current allowance for CanjeManager
  const { data: allowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "VoluntarioToken",
    functionName: "allowance",
    args: [connectedAddress, canjeManagerAddress],
  });

  // Handle redeem button click
  const handleRedeem = async (recompensaId: bigint) => {
    try {
      setRedeemingId(recompensaId);

      // Check if we have the contract address
      if (!canjeManagerAddress) {
        throw new Error("Dirección del contrato CanjeManager no disponible");
      }

      // Find the reward to get the token cost
      const reward = filteredRewards.find(r => r.id === recompensaId);
      if (!reward) {
        throw new Error("Recompensa no encontrada");
      }

      // Check if we have enough allowance
      const currentAllowance = allowance || 0n;

      if (currentAllowance < reward.tokenCost) {
        // Need to approve tokens first
        setApprovingId(recompensaId);
        console.log("Aprobando tokens...");
        await approveTokens({
          functionName: "approve",
          args: [canjeManagerAddress, reward.tokenCost],
        });

        // Refetch allowance to confirm approval
        await refetchAllowance();
        setApprovingId(null);
      }

      // Now redeem the reward
      console.log("Canjeando recompensa...");
      await writeContractAsync({
        functionName: "canjearRecompensa",
        args: [recompensaId],
      });

      // Reset redeeming state after success
      setRedeemingId(null);
    } catch (error) {
      console.error("Error al canjear recompensa:", error);
      setRedeemingId(null);
      setApprovingId(null);
    }
  };

  useEffect(() => {
    if (recompensas) {
      const activeRewards = recompensas.filter(reward => reward.activa);

      const uniqueCategories = ["Todos", ...new Set(activeRewards.map(reward => reward.category))];
      setCategories(uniqueCategories);

      if (selectedCategory === "Todos") {
        setFilteredRewards(activeRewards);
      } else {
        setFilteredRewards(activeRewards.filter(reward => reward.category === selectedCategory));
      }
    }
  }, [recompensas, selectedCategory]);

  // Filter rewards based on selected category
  useEffect(() => {
    if (!recompensas) return;

    const activeRewards = recompensas.filter(reward => reward.activa);

    if (selectedCategory === "Todos") {
      setFilteredRewards(activeRewards);
    } else {
      setFilteredRewards(activeRewards.filter(reward => reward.category === selectedCategory));
    }
  }, [selectedCategory, recompensas]);

  return (
    <div className="flex flex-col w-full items-center justify-center px-4 py-8">
      <div className="w-full flex max-w-screen-2xl flex-col items-center justify-center">
        {/* Header section */}
        <div className="flex flex-col w-full text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Canjeo de Recompensas</h1>
          <p className="text-lg">Canjea tus tokens de voluntariado por cursos, mentorías, servicios y productos</p>

          {/* User Token Balance Display */}
          {connectedAddress && (
            <div className="mt-6 p-4 bg-base-200 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">Tu saldo:</span>
                {isLoadingBalance ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {userTokenBalance ? formatEther(userTokenBalance) : "0"} VOL
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4">Cargando recompensas...</p>
          </div>
        )}

        {/* Content when loaded */}
        {!isLoading && (
          <>
            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map(category => (
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
                <div key={Number(reward.id)} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                  <figure className="h-48 relative">
                    <Image src={reward.imageUrl} unoptimized alt={reward.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2 badge badge-primary p-3">
                      {formatEther(reward.tokenCost)} VOL
                    </div>
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title">{reward.title}</h3>
                    <p className="text-sm text-gray-500 mt-0 mb-1">por {reward.provider}</p>
                    <p className="line-clamp-2 mt-1 text-sm mb-4">{reward.description}</p>
                    <div className="card-actions justify-between items-center">
                      <div className="badge badge-primary">{reward.category}</div>
                      <button
                        className={`btn btn-primary btn-sm ${
                          !connectedAddress || !userTokenBalance || userTokenBalance < reward.tokenCost || isPending
                            ? "btn-disabled"
                            : ""
                        }`}
                        disabled={
                          !connectedAddress || !userTokenBalance || userTokenBalance < reward.tokenCost || isPending
                        }
                        onClick={() => handleRedeem(reward.id)}
                      >
                        {approvingId === reward.id ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Aprobando...
                          </>
                        ) : redeemingId === reward.id ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Canjeando...
                          </>
                        ) : !connectedAddress ? (
                          "Conecta wallet"
                        ) : !userTokenBalance || userTokenBalance < reward.tokenCost ? (
                          "Tokens insuficientes"
                        ) : (
                          "Canjear"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>

            {/* Empty state */}
            {filteredRewards.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No hay recompensas en esta categoría</h3>
                <p>Por favor, intenta seleccionar otra categoría</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
