const { ethers } = require("hardhat");

const args = {
  type: "membership",
  deployConfig: {
    name: "Product NFT",
    symbol: "KPT",
    owner: "0x4db8bccf4385c7aa46f48eb42f70fa41df917b44",
    tokensBurnable: false,
    tokenCounter: "0x4817c9640c0d9bCd5e4a16bFD642A53682C84a82",
  },
  runConfig: {
    baseURI: "ipfs://", //TODO: From env
    metadataUpdatable: true,
    tokensTransferable: true,
    isRoyaltiesEnabled: true,
    royaltiesBps: 250, // 2.5%
    royaltiesAddress: "0x3Cb6976FE2065E7FEb5a99601f32703808667a64", //TODO: Change with royalty address!!
    primaryMintPrice: ethers.utils.parseEther("0.2"),
    // primaryMintPrice: 0,
    treasuryAddress: "0x1d714E1862E394519368a56A5300b7a7240d2b66",
  },
};

module.exports = [
  args.deployConfig,
  args.runConfig,
  [],
  "0xad21480db7f83a1D53F24B651f368F665C38cb00",
];
