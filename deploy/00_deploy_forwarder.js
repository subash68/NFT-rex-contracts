const {
  DefenderRelayProvider,
  DefenderRelaySigner,
} = require("defender-relay-client/lib/ethers");
const { ethers } = require("hardhat");
const { writeFileSync } = require("fs");

require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const credentials = {
    apiKey: process.env.RELAYER_API_KEY,
    apiSecret: process.env.RELAYER_API_SECRET,
  };

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });

  const Forwarder = await ethers.getContractFactory("MinimalForwarder");
  const forwarder = await Forwarder.connect(relaySigner)
    .deploy()
    .then((f) => f.deployed());

  writeFileSync(
    "relayer/forwarder.json",
    JSON.stringify(
      {
        MinimalForwarder: forwarder.address,
      },
      null,
      2
    )
  );
};

module.exports.tags = ["Fowarder"];
