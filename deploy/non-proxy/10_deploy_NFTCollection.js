const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deploymentConfiguration = {
    name: "Product NFT",
    symbol: "KPT",
    owner: deployer,
    tokensBurnable: false,
    tokenCounter: "0xAa778D9B4dDfF42fcBE5BF0e5A6772e6c0b35045",
  };

  const runtimeConfiguration = {
    baseURI: "ipfs://", //TODO: From env
    metadataUpdatable: true,
    tokensTransferable: true,
    isRoyaltiesEnabled: true,
    royaltiesBps: 250, // 2.5%
    royaltiesAddress: "0x3Cb6976FE2065E7FEb5a99601f32703808667a64", //TODO: Change with royalty address!!
    primaryMintPrice: ethers.utils.parseEther("0.2"),
    // primaryMintPrice: 0,
    treasuryAddress: "0x1d714E1862E394519368a56A5300b7a7240d2b66",
  };

  const ERC721NFTCustom = await ethers.getContractFactory("ERC721NFTCustom");
  const collection = await ERC721NFTCustom.deploy(
    deploymentConfiguration,
    runtimeConfiguration,
    []
  );

  await collection.deployed();
  console.log(`Collection contract is deployed at ${collection.address}`);

  console.log(deploymentConfiguration);
  console.log(runtimeConfiguration);
};

module.exports.tags = ["ERC721NFTCustomReplaced"];
