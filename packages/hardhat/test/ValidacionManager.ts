import { ethers } from "hardhat";
import { expect } from "chai";
import { EventManager, VoluntarioToken, ValidacionManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ValidacionManager", function () {
  let eventManager: EventManager;
  let voluntarioToken: VoluntarioToken;
  let validacionManager: ValidacionManager;
  let owner: HardhatEthersSigner, voluntario: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, voluntario] = await ethers.getSigners();
    const VoluntarioToken = await ethers.getContractFactory("VoluntarioToken");
    voluntarioToken = await VoluntarioToken.deploy();
    await voluntarioToken.waitForDeployment();
    const EventManager = await ethers.getContractFactory("EventManager");
    eventManager = await EventManager.deploy();
    await eventManager.waitForDeployment();
    const ValidacionManager = await ethers.getContractFactory("ValidacionManager");
    validacionManager = await ValidacionManager.deploy(voluntarioToken.target, eventManager.target);
    await validacionManager.waitForDeployment();

    await eventManager
      .connect(owner)
      .crearEvento(
        100,
        "Evento Test",
        "Desc corta",
        "Desc larga",
        "img1",
        "logo1",
        "2025-08-03",
        "Ubicacion 1",
        "CategoriaA",
      );

    await eventManager
      .connect(owner)
      .crearEvento(200, "Evento 2", "Desc 2", "Desc 2", "img2", "logo2", "4035-08-03", "Ubicacion 2", "CategoriaB");

    await eventManager.connect(owner).inscribirseAEvento(1, "Owner", "owner@email.com", "7513434");
    await eventManager.connect(voluntario).inscribirseAEvento(1, "Juan Perez", "juan@email.com", "123456789");
  });

  it("should validate a single volunteer's attendance and mint tokens", async function () {
    await validacionManager.connect(owner).validarAsistenciaUnica(1, voluntario.address);
    const balance = await voluntarioToken.balanceOf(voluntario.address);
    expect(balance).to.equal(200);

    const datos = await eventManager.obtenerDatosVoluntario(1, voluntario.address);
    expect(datos.aprobado).to.equal(true);
  });

  it("should validate a same owner's attendance and mint tokens", async function () {
    await validacionManager.connect(owner).validarAsistenciaUnica(1, owner.address);
    const balance = await voluntarioToken.balanceOf(owner.address);
    expect(balance).to.equal(200);

    const datos = await eventManager.obtenerDatosVoluntario(1, owner.address);
    expect(datos.aprobado).to.equal(true);
  });
});
