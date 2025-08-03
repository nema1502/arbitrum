import { ethers } from "hardhat";
import { expect } from "chai";
import { CanjeManager, VoluntarioToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CanjeManager", function () {
  let canjeManager: CanjeManager;
  let voluntarioToken: VoluntarioToken;
  let usuario: HardhatEthersSigner;
  let organizacion: HardhatEthersSigner;

  beforeEach(async function () {
    [, usuario, organizacion] = await ethers.getSigners();

    // Deploy VoluntarioToken
    const VoluntarioToken = await ethers.getContractFactory("VoluntarioToken");
    voluntarioToken = await VoluntarioToken.deploy();
    await voluntarioToken.waitForDeployment();

    // Deploy CanjeManager
    const CanjeManager = await ethers.getContractFactory("CanjeManager");
    canjeManager = await CanjeManager.deploy(await voluntarioToken.getAddress());
    await canjeManager.waitForDeployment();

    // Mint some tokens to usuario for testing
    await voluntarioToken.mint(usuario.address, ethers.parseEther("1000"));
  });

  describe("Crear Recompensa", function () {
    it("should create a reward successfully", async function () {
      const tx = await canjeManager
        .connect(organizacion)
        .crearRecompensa(
          ethers.parseEther("100"),
          "Recompensa Test",
          "Descripción de prueba",
          "https://imagen.com/test.jpg",
          "Proveedor Test",
          "Categoria Test",
        );

      await expect(tx)
        .to.emit(canjeManager, "RecompensaCreada")
        .withArgs(0, organizacion.address, "Recompensa Test", ethers.parseEther("100"), "Categoria Test");

      const totalRecompensas = await canjeManager.totalRecompensas();
      expect(totalRecompensas).to.equal(1);
    });

    it("should retrieve reward details correctly", async function () {
      await canjeManager
        .connect(organizacion)
        .crearRecompensa(
          ethers.parseEther("100"),
          "Recompensa Test",
          "Descripción de prueba",
          "https://imagen.com/test.jpg",
          "Proveedor Test",
          "Categoria Test",
        );

      const recompensa = await canjeManager.obtenerRecompensa(0);
      expect(recompensa.id).to.equal(0);
      expect(recompensa.creador).to.equal(organizacion.address);
      expect(recompensa.title).to.equal("Recompensa Test");
      expect(recompensa.tokenCost).to.equal(ethers.parseEther("100"));
      expect(recompensa.activa).to.equal(true);
    });
  });

  describe("Canjear Recompensa", function () {
    beforeEach(async function () {
      // Create a reward for testing
      await canjeManager
        .connect(organizacion)
        .crearRecompensa(
          ethers.parseEther("100"),
          "Recompensa Test",
          "Descripción de prueba",
          "https://imagen.com/test.jpg",
          "Proveedor Test",
          "Categoria Test",
        );
    });

    it("should fail without approval - demonstrating the error", async function () {
      // This test demonstrates the ERC20InsufficientAllowance error
      await expect(canjeManager.connect(usuario).canjearRecompensa(0))
        .to.be.revertedWithCustomError(voluntarioToken, "ERC20InsufficientAllowance")
        .withArgs(await canjeManager.getAddress(), 0, ethers.parseEther("100"));
    });

    it("should succeed with proper approval", async function () {
      // First, user must approve the CanjeManager contract to spend their tokens
      await voluntarioToken.connect(usuario).approve(await canjeManager.getAddress(), ethers.parseEther("100"));

      // Now the canjearRecompensa should work
      const tx = await canjeManager.connect(usuario).canjearRecompensa(0);

      await expect(tx).to.emit(canjeManager, "RecompensaCanjeada").withArgs(usuario.address, 0);

      // Check that tokens were transferred from user to contract
      const userBalance = await voluntarioToken.balanceOf(usuario.address);
      const contractBalance = await voluntarioToken.balanceOf(await canjeManager.getAddress());

      expect(userBalance).to.equal(ethers.parseEther("900")); // 1000 - 100
      expect(contractBalance).to.equal(ethers.parseEther("100"));
    });

    it("should fail with insufficient tokens", async function () {
      // Create a user with no tokens
      const [, , , usuarioSinTokens] = await ethers.getSigners();

      // Approve first
      await voluntarioToken
        .connect(usuarioSinTokens)
        .approve(await canjeManager.getAddress(), ethers.parseEther("100"));

      // Should fail due to insufficient balance
      await expect(canjeManager.connect(usuarioSinTokens).canjearRecompensa(0)).to.be.revertedWith(
        "No tienes suficientes tokens",
      );
    });

    it("should fail with insufficient allowance", async function () {
      // Approve only 50 tokens when 100 are needed
      await voluntarioToken.connect(usuario).approve(await canjeManager.getAddress(), ethers.parseEther("50"));

      await expect(canjeManager.connect(usuario).canjearRecompensa(0))
        .to.be.revertedWithCustomError(voluntarioToken, "ERC20InsufficientAllowance")
        .withArgs(await canjeManager.getAddress(), ethers.parseEther("50"), ethers.parseEther("100"));
    });
  });

  describe("Gestión de Recompensas", function () {
    beforeEach(async function () {
      await canjeManager
        .connect(organizacion)
        .crearRecompensa(
          ethers.parseEther("100"),
          "Recompensa Test",
          "Descripción de prueba",
          "https://imagen.com/test.jpg",
          "Proveedor Test",
          "Categoria Test",
        );
    });

    it("should allow creator to change reward status", async function () {
      await canjeManager.connect(organizacion).cambiarEstadoRecompensa(0, false);

      const recompensa = await canjeManager.obtenerRecompensa(0);
      expect(recompensa.activa).to.equal(false);
    });

    it("should fail when non-creator tries to change status", async function () {
      await expect(canjeManager.connect(usuario).cambiarEstadoRecompensa(0, false)).to.be.revertedWith(
        "No eres el creador",
      );
    });

    it("should fail to redeem inactive reward", async function () {
      // Deactivate reward
      await canjeManager.connect(organizacion).cambiarEstadoRecompensa(0, false);

      // Approve tokens
      await voluntarioToken.connect(usuario).approve(await canjeManager.getAddress(), ethers.parseEther("100"));

      // Should fail because reward is inactive
      await expect(canjeManager.connect(usuario).canjearRecompensa(0)).to.be.revertedWith(
        "La recompensa no esta activa",
      );
    });
  });
});
