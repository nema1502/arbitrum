"use client";

import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface UserTokenBalanceProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const UserTokenBalance = ({ className = "", showLabel = true, size = "md" }: UserTokenBalanceProps) => {
  const { address: connectedAddress } = useAccount();

  const { data: userTokenBalance, isLoading: isLoadingBalance } = useScaffoldReadContract({
    contractName: "VoluntarioToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  if (!connectedAddress) {
    return null;
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className={`font-medium ${size === "sm" ? "text-xs" : "text-sm"}`}>Saldo:</span>}
      {isLoadingBalance ? (
        <span className={`loading loading-spinner ${size === "sm" ? "loading-xs" : "loading-sm"}`}></span>
      ) : (
        <span className={`font-bold text-primary ${sizeClasses[size]}`}>
          {userTokenBalance ? formatEther(userTokenBalance) : "0"} VOL
        </span>
      )}
    </div>
  );
};
