const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const ItargoNFT = artifacts.require("ItargoNFT");

module.exports = async function(deployer) {
  const instance = await deployProxy(ItargoNFT, ["Itargo NFT", "ITARGO NFT"], { deployer });
}
