import { ethers } from "hardhat";
import { expect } from "chai";
import { EventManager } from "../typechain-types";
import { ContractTransactionResponse } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

export type DeployedContract = EventManager & {
  deploymentTransaction(): ContractTransactionResponse;
};

describe("EventManager", function () {
  let eventManager: DeployedContract;
  let owner: any;
  // let addr1: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const EventManager = await ethers.getContractFactory("EventManager");
    eventManager = await EventManager.deploy();
    await eventManager.waitForDeployment();
  });

  it("should create an event and emit EventoCreado", async function () {
    const tx = await eventManager.crearEvento(
      100,
      "Evento 1",
      "Desc corta",
      "Desc larga",
      "https://img.com/1.jpg",
      "https://logo.com/1.png",
      "2025-08-03",
      "Ubicacion 1",
      "CategoriaA",
    );
    await expect(tx)
      .to.emit(eventManager, "EventoCreado")
      .withArgs(0, owner.address, 100, "Evento 1", "CategoriaA", "2025-08-03", "Ubicacion 1");
    const total = await eventManager.totalEventos();
    expect(total).to.equal(1);
  });

  it("should return the list of all events", async function () {
    await eventManager.crearEvento(
      100,
      "Evento 1",
      "Desc corta",
      "Desc larga",
      "img1",
      "logo1",
      "2025-08-03",
      "Ubicacion 1",
      "CategoriaA",
    );
    await eventManager.crearEvento(
      200,
      "Evento 2",
      "Desc corta2",
      "Desc larga2",
      "img2",
      "logo2",
      "2025-08-04",
      "Ubicacion 2",
      "CategoriaB",
    );
    const eventos = await eventManager.obtenerTodosLosEventos();
    expect(eventos.length).to.equal(2);
    expect(eventos[0].title).to.equal("Evento 1");
    expect(eventos[1].title).to.equal("Evento 2");
  });

  it("should get an event by id", async function () {
    await eventManager.crearEvento(
      100,
      "Evento 1",
      "Desc 1",
      "Desc 1",
      "img1",
      "logo1",
      "2025-08-03",
      "Ubicacion 1",
      "CategoriaA",
    );
    await eventManager.crearEvento(
      200,
      "Evento 2",
      "Desc 2",
      "Desc 2",
      "img2",
      "logo2",
      "2025-08-04",
      "Ubicacion 2",
      "CategoriaB",
    );
    const evento1 = await eventManager.eventos(0);
    expect(evento1.title).to.equal("Evento 1");
    expect(evento1.organizador).to.equal(owner.address);
    expect(evento1.recompensaPorVoluntario).to.equal(100);

    const evento2 = await eventManager.eventos(1);
    expect(evento2.title).to.equal("Evento 2");
    expect(evento2.organizador).to.equal(owner.address);
    expect(evento2.recompensaPorVoluntario).to.equal(200);
  });
});

describe("EventManager - Volunteer Registration and Retrieval", function () {
  let eventManager: DeployedContract;
  let owner: HardhatEthersSigner, voluntario1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, voluntario1] = await ethers.getSigners();
    const EventManager = await ethers.getContractFactory("EventManager");
    eventManager = await EventManager.deploy();
    await eventManager.waitForDeployment();
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
  });

  it("should allow a volunteer to register for an event and emit VoluntarioInscrito", async function () {
    const tx = await eventManager
      .connect(voluntario1)
      .inscribirseAEvento(0, "Juan Perez", "juan@email.com", "123456789");
    await expect(tx)
      .to.emit(eventManager, "VoluntarioInscrito")
      .withArgs(0, voluntario1.address, "Juan Perez", "juan@email.com", "123456789");

    const estaInscrito = await eventManager.estaInscrito(0, voluntario1.address);
    expect(estaInscrito).to.equal(true);
  });

  it("should return the list of volunteer data for an event", async function () {
    // Register two volunteers
    const [, v1, v2] = await ethers.getSigners();
    await eventManager.connect(v1).inscribirseAEvento(0, "Ana Lopez", "ana@email.com", "987654321");
    await eventManager.connect(v2).inscribirseAEvento(0, "Carlos Ruiz", "carlos@email.com", "555555555");

    const voluntarios = await eventManager.obtenerTodosLosVoluntarios(0);
    expect(voluntarios.length).to.equal(2);
    const nombres = voluntarios.map((v: any) => v.nombre);
    expect(nombres).to.include("Ana Lopez");
    expect(nombres).to.include("Carlos Ruiz");
    const emails = voluntarios.map((v: any) => v.email);
    expect(emails).to.include("ana@email.com");
    expect(emails).to.include("carlos@email.com");
  });
});
