const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // DAO creation setup
  const creatorDAOConfiguration = {
    name: "Creator DAO",
    owner: deployer,
  };

  const creatorDAO = await ethers.getContractFactory("CreatorDAOUpgradeable");
  const proxy = await upgrades.deployProxy(creatorDAO, [
    creatorDAOConfiguration,
    [],
  ]);

  await proxy.deployed();
  console.log(`DAO proxy is deployed at ${proxy.address}`);
};

module.exports.tags = ["CreatorDAOUpgradeable"];
