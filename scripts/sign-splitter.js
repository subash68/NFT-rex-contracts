require("dotenv").config();

const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../src/signer");
const { readFileSync, writeFileSync } = require("fs");

function getInstance(name) {
  const address = JSON.parse(
    readFileSync("relayer/RoyaltySplitterFactory.json")
  )[name];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");
  const splitterFactory = await getInstance("RoyaltySplitterFactory");
  const { SIGNER_KEY: signer } = process.env;
  const from = new ethers.Wallet(signer).address;
  //   const admin = new ethers.Wallet(adminkey).address;

  const args = {
    receivers: [from],
    shares: [10],
    collection: "0x2629115E42C58bD4DA27ed8616483C043d1a857b",
  };

  writeFileSync("verify/cloneSplitter.js", JSON.stringify(args, null, 2));

  const data = splitterFactory.interface.encodeFunctionData("cloneContract", [
    args,
  ]);

  const result = await signMetaTxRequest(signer, forwarder, {
    to: splitterFactory.address,
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
