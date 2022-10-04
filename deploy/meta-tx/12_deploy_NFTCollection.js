require("dotenv").config();
const {
  DefenderRelayProvider,
  DefenderRelaySigner,
} = require("defender-relay-client/lib/ethers");
const { ethers } = require("hardhat");
const { writeFileSync } = require("fs");
const { MinimalForwarder } = require("../../relayer/forwarder.json");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const credentials = {
    apiKey: process.env.RELAYER_API_KEY,
    apiSecret: process.env.RELAYER_API_SECRET,
  };

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });

  console.log(deployer);
  const args = {
    deployConfig: {
      name: "Dino Reward",
      symbol: "DRT",
      owner: deployer,
      tokensBurnable: false,
      tokenCounter: "0x1901E1D9f2554a6605379Be7dBe4004c6DAacCd1",
    },
    runConfig: {
      baseURI: "ipfs://", //TODO: From env
      metadataUpdatable: true,
      tokensTransferable: true,
      isRoyaltiesEnabled: true,
      royaltiesBps: 250,
    },
  };

  const ERC721NFTCustom = await ethers.getContractFactory("ERC721NFTCustom");
  const collection = await ERC721NFTCustom.connect(relaySigner)
    .deploy(args.deployConfig, args.runConfig, MinimalForwarder)
    .then((f) => f.deployed());

  writeFileSync(
    "relayer/NFTCollectionImplementation.json",
    JSON.stringify(
      {
        MinimalForwarder: MinimalForwarder,
        ERC721NFTCustom: collection.address,
      },
      null,
      2
    )
  );
};

module.exports.tags = ["ERC721NFTCustom"];
