const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments; // This becomes the directory of artifacts 
    const { deployer } = await getNamedAccounts();

    // Initial setup should be zero, so that project owner can add this later
    const paymentSplitterConfig =  {
        receivers: [deployer], // TODO: Change default address for Decir
        shares: [2],  // TODO: Default percentage for Decir
        membershipToken: ethers.constants.AddressZero
    };

    const upgradeableSplitter = await ethers.getContractFactory ("RoyaltySplitterUpgradeable");
    const proxy = await upgrades.deployProxy(
        upgradeableSplitter, [paymentSplitterConfig]);

    await proxy.deployed();
    console.log(`Splitter proxy is deployed at ${proxy.address}`);
  };
  
  module.exports.tags = ["RoyaltySplitterUpgradeable"];