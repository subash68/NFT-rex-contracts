require("dotenv").config();
const {
  DefenderRelayProvider,
  DefenderRelaySigner,
} = require("defender-relay-client/lib/ethers");
const { ethers } = require("hardhat");
const { writeFileSync } = require("fs");
const { MinimalForwarder } = require("../relayer/forwarder.json");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const credentials = {
    apiKey: process.env.RELAYER_API_KEY,
    apiSecret: process.env.RELAYER_API_SECRET,
  };

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });

  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.connect(relaySigner)
    .deploy(MinimalForwarder)
    .then((f) => f.deployed());

  writeFileSync(
    "relayer/counter.json",
    JSON.stringify(
      {
        MinimalForwarder: MinimalForwarder,
        Counter: counter.address,
      },
      null,
      2
    )
  );
};

module.exports.tags = ["Counter"];
