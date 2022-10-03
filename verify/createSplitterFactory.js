const { MinimalForwarder } = require("../relayer/RoyaltySplitterFactory.json");
const {
  RoyaltySplitter,
} = require("../relayer/RoyaltySplitterImplementation.json");

module.exports = [RoyaltySplitter, MinimalForwarder];
