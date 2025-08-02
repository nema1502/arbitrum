import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { VoluntarioToken } from "../typechain-types"; // Importamos el tipo específico del contrato

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 1. Desplegar VoluntarioToken
  await deploy("VoluntarioToken", { from: deployer, args: [], log: true });
  // Obtenemos la instancia del contrato con su tipo específico para que TypeScript lo entienda
  const voluntarioToken = await hre.ethers.getContract<VoluntarioToken>("VoluntarioToken", deployer);

  // 2. Desplegar EventManager
  await deploy("EventManager", { from: deployer, args: [], log: true });
  const eventManager = await hre.ethers.getContract("EventManager", deployer);

  // 3. Desplegar ValidacionManager, inyectando las direcciones
  await deploy("ValidacionManager", {
    from: deployer,
    args: [await voluntarioToken.getAddress(), await eventManager.getAddress()],
    log: true,
  });

  // 4. Desplegar CanjeManager, inyectando la dirección del token
  await deploy("CanjeManager", {
    from: deployer,
    args: [await voluntarioToken.getAddress()],
    log: true,
  });

  // Paso de seguridad final: ahora estas llamadas funcionarán sin errores de tipo.
  const validacionManager = await hre.ethers.getContract("ValidacionManager", deployer);
  const minterRole = await voluntarioToken.MINTER_ROLE();
  console.log("Transfiriendo MINTER_ROLE a ValidacionManager...");
  await voluntarioToken.grantRole(minterRole, await validacionManager.getAddress());
  console.log("Rol transferido. Renunciando al rol desde la cuenta del desplegador...");
  await voluntarioToken.renounceRole(minterRole, deployer);
  console.log("Rol renunciado. Despliegue de roles completo.");
};

export default deployContracts;
deployContracts.tags = ["VoluntarioToken", "EventManager", "ValidacionManager", "CanjeManager"];
