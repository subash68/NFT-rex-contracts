const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments; // This becomes the directory of artifacts
    const { deployer } = await getNamedAccounts();

    const deploymentConfiguration = {
        name: "Rights Attached NFT v0.1",
        symbol: "RAT",
        owner: deployer,
        tokensBurnable: false,
        tokenCounter: "0xAa778D9B4dDfF42fcBE5BF0e5A6772e6c0b35045"
    };

    const runtimeConfiguration = {
        baseURI: "",
        metadataUpdatable: true,
        tokensTransferable: false,
        isRoyaltiesEnabled: false,
        royaltiesBps: 0, 
        royaltiesAddress: ethers.constants.AddressZero,
        primaryMintPrice: ethers.utils.parseEther("0"),
		treasuryAddress: ethers.constants.AddressZero
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

module.exports.tags = ["RightsAttachedNFTContract"];