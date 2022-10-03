require("dotenv").config();

const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../src/signer");
const { readFileSync, writeFileSync } = require("fs");

function getInstance(name) {
  const address = JSON.parse(
    readFileSync("relayer/ERC721CollectionFactory.json")
  )[name];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");
  const collectionFactory = await getInstance("ERC721CollectionFactory");
  const { SIGNER_KEY: signer } = process.env;
  const from = new ethers.Wallet(signer).address;
  //   const admin = new ethers.Wallet(adminkey).address;

  const args = {
    type: "membership",
    deployConfig: {
      name: "Product NFT",
      symbol: "KPT",
      owner: from,
      tokensBurnable: false,
      tokenCounter: process.env.TOKEN_COUNTER_CONTRACT,
    },
    runConfig: {
      baseURI: process.env.IPFS_BASE_URL,
      metadataUpdatable: true,
      tokensTransferable: true,
      isRoyaltiesEnabled: true,
      royaltiesBps: process.env.DEFAULT_ROYALTY_BIPS, // 2.5%
      primaryMintPrice: ethers.utils.parseEther("0.2"),
      treasuryAddress: process.env.DEFAULT_TREASURY,
    },
    roles: [
      // {
      //   role:
      //     "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
      //   addresses: [from],
      //   frozen: true,
      // },
    ],
  };

  writeFileSync("verify/cloneCollection.js", JSON.stringify(args, null, 2));

  const data = collectionFactory.interface.encodeFunctionData("cloneContract", [
    args.deployConfig,
    args.runConfig,
    args.roles,
  ]);

  const result = await signMetaTxRequest(signer, forwarder, {
    to: collectionFactory.address,
    from,
    data,
  });

  writeFileSync("tmp/request.json", JSON.stringify(result, null, 2));
  console.log(`Signature: `, result.signature);
  console.log(`Request: `, result.request);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
