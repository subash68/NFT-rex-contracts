const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments; // This becomes the directory of artifacts
    const { deployer } = await getNamedAccounts();

    const deploymentConfiguration = {
        name: "Membership NFT v0.1",
        symbol: "MST",
        owner: deployer,
        tokensBurnable: false,
        tokenCounter: "0xAa778D9B4dDfF42fcBE5BF0e5A6772e6c0b35045"
    };

    const runtimeConfiguration = {
        baseURI: "",
        metadataUpdatable: true,
        tokensTransferable: true,
        isRoyaltiesEnabled: true,
        royaltiesBps: 500, // 2.5%
        royaltiesAddress: deployer, //TODO: This should be changed to royalty splitter address
        primaryMintPrice: ethers.utils.parseEther("0.1"),
        treasuryAddress : "0x1d714E1862E394519368a56A5300b7a7240d2b66"
    };

    const Upgradable721 = await ethers.getContractFactory("ERC721UpgradeableCustom");
    const proxy = await upgrades.deployProxy(
        Upgradable721, [
            deploymentConfiguration, 
            runtimeConfiguration, 
            []
        ]);
    await proxy.deployed();

    console.log(`Proxy is deployed at following address: ${proxy.address}`);
};

module.exports.tags = ["UpgradableNFTContract"];