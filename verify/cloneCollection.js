const args = {
  type: "membership",
  deployConfig: {
    name: "Product NFT",
    symbol: "KPT",
    owner: "0x287f0B854a2Ba9Dc3E8572c68bDabD949819F119",
    tokensBurnable: false,
    tokenCounter: "0x1901E1D9f2554a6605379Be7dBe4004c6DAacCd1",
  },
  runConfig: {
    baseURI: "ipfs://",
    metadataUpdatable: true,
    tokensTransferable: true,
    isRoyaltiesEnabled: true,
    royaltiesBps: "250",
    primaryMintPrice: {
      type: "BigNumber",
      hex: "0x02c68af0bb140000",
    },
    treasuryAddress: "0xbeD402c38C0fEcADfD0fE8B5DF95E4511Dd5C7C3",
  },
  roles: [],
};
