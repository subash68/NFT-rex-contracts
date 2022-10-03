const { MinimalForwarder } = require("../relayer/ERC721CollectionFactory.json");
const {
  ERC721NFTCustom,
} = require("../relayer/NFTCollectionImplementation.json");

module.exports = [ERC721NFTCustom, MinimalForwarder];
