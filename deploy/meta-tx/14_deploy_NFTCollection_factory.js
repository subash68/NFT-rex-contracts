require("dotenv").config();
const {
  DefenderRelayProvider,
  DefenderRelaySigner,
} = require("defender-relay-client/lib/ethers");
const { ethers } = require("hardhat");
const { writeFileSync } = require("fs");
const {
  ERC721NFTCustom,
  MinimalForwarder,
} = require("../../relayer/NFTCollectionImplementation.json");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const credentials = {
    apiKey: process.env.RELAYER_API_KEY,
    apiSecret: process.env.RELAYER_API_SECRET,
  };

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });

  const CollectionFactory = await ethers.getContractFactory(
    "ERC721CollectionFactory"
  );
  const collectionFactory = await CollectionFactory.connect(relaySigner)
    .deploy(ERC721NFTCustom, MinimalForwarder)
    .then((f) => f.deployed());

  writeFileSync(
    "relayer/ERC721CollectionFactory.json",
    JSON.stringify(
      {
        MinimalForwarder: MinimalForwarder,
        ERC721CollectionFactory: collectionFactory.address,
      },
      null,
      2
    )
  );
};

module.exports.tags = ["CollectionFactory"];
