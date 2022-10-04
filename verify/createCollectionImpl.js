const {
  MinimalForwarder,
} = require("../relayer/NFTCollectionImplementation.json");

const args = {
  deployConfig: {
    name: "Dino Reward",
    symbol: "DRT",
    owner: "0x4db8bcCF4385C7AA46F48eb42f70FA41Df917b44",
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

module.exports = [args.deployConfig, args.runConfig, MinimalForwarder];
