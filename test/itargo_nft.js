const truffleAssert = require('truffle-assertions');
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')
const ItargoNFT = artifacts.require("ItargoNFT");
const BigNumber = web3.utils.BN;

require("chai")
  .use(require("chai-bn")(BigNumber))
  .should();

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('ItargoNFT', (accounts) => {
  let instance;

  const _name = "Itargo NFT";
  const _symbol = "ITARGO NFT";

  const number1 = new BigNumber(1);
  const number2 = new BigNumber(2);

  beforeEach('should setup the contract instance', async () => {
    // 한 번만 배포하여 재사용하고 싶을 경우, await ItargoNFT.deployed()
    // await ItargoNFT.new()

    // 각 unit test마다 새로 배포
    instance = await deployProxy(ItargoNFT, [_name, _symbol])
  });

  describe("[Testcase 1: Initialization]", () => {
    // msg.sender = owner = accounts[0]
    it("1.1. Ownable", async () => {
      (await instance.owner()).should.eq(accounts[0]);
    });

    it("1.2. Token name", async function() {
      (await instance.name()).should.eq(_name);
    });

    it("1.3. Token symbol", async function() {
      (await instance.symbol()).should.eq(_symbol);
    });
  });

  describe("[Testcase 2: Lazy Mint]", () => {
    it("2.1. Caller must be the owner", async () => {
      await truffleAssert.reverts(instance.lazyMint(accounts[2], accounts[3], 1, "not owner", {
        'from': accounts[1]
      }));
    });

    // approve하지 않고 호출하면 에러
    it("2.2. Creator must approve to our service", async () => {
      await truffleAssert.reverts(instance.lazyMint(accounts[1], accounts[2], 2, "not approved", {
        'from': accounts[0]
      }));
    });

    it("2.3. Business logic", async () => {
      // accounts[1]이 자신의 계좌를 accounts[0](owner, deployer)에게 허락함
      await instance.setApprovalForAll(accounts[0], true, {
        'from': accounts[1]
      });

      await instance.lazyMint(accounts[1], accounts[2], 3, "common case", {
        'from': accounts[0]
      });

      (await instance.count()).should.be.bignumber.equal(number1);
    });

    it("2.4. Token owner", async () => {
      await instance.setApprovalForAll(accounts[0], true, {
        'from': accounts[1]
      });

      await instance.lazyMint(accounts[1], accounts[2], 4, "itargo", {
        'from': accounts[0]
      });

      (await instance.ownerOf(4)).should.eq(accounts[2]);
    });

    it("2.5. Random token ID", async () => {
      // 0 <= random <= 99
      const rand = Math.floor(Math.random() * 100);

      await instance.setApprovalForAll(accounts[0], true, {
        'from': accounts[1]
      });

      await instance.lazyMint(accounts[1], accounts[2], rand, "random id", {
        'from': accounts[0]
      });

      (await instance.ownerOf(rand)).should.eq(accounts[2]);
    });

    it("2.6. Token Metadata", async () => {
      const tokenURI = "https://itargo.io";
      await instance.setApprovalForAll(accounts[0], true, {
        'from': accounts[1]
      });

      await instance.lazyMint(accounts[1], accounts[2], 6, tokenURI, {
        'from': accounts[0]
      });

      (await instance.tokenURI(6)).should.eq(tokenURI);
    });

    it("2.7. Creator", async () => {
      await instance.setApprovalForAll(accounts[0], true, {
        'from': accounts[1]
      });

      await instance.lazyMint(accounts[1], accounts[2], 1, "creator", {
        'from': accounts[0]
      });

      (await instance.creatorOf(1)).should.eq(accounts[1]);
    });

    it("2.8. count() equals the number of token minted", async () => {
      const rand1 = Math.floor(Math.random() * 100);
      const rand2 = Math.floor(Math.random() * 100);

      await instance.setApprovalForAll(accounts[0], true, {
        'from': accounts[1]
      });

      // 1st mint
      await instance.lazyMint(accounts[1], accounts[2], rand1, "woo", {
        'from': accounts[0]
      });

      (await instance.count()).should.be.bignumber.equal(number1);

      // 2nd mint
      await instance.lazyMint(accounts[1], accounts[2], rand2, "joo", {
        'from': accounts[0]
      });

      (await instance.count()).should.be.bignumber.equal(number2);
    });
  });

  describe("[Testcase 3: Mint]", () => {
    it("3.1. Caller must be the owner", async () => {
      await truffleAssert.reverts(instance.mint(accounts[2], 1, {
        'from': accounts[1]
      }));
    });

    it("3.2. Creator", async () => {
      await instance.mint(accounts[1], 1, {
        'from': accounts[0]
      });

      (await instance.creatorOf(1)).should.eq(accounts[1]);
    });
  });

  describe("[Testcase 4: Docs]", () => {
    it("4.1. Caller must be the owner", async () => {
      await instance.mint(accounts[1], 1, {
        'from': accounts[0]
      });

      await truffleAssert.reverts(instance.setTokenDocs("not owner", 1, {
        'from': accounts[1]
      }));
    });
  });

  describe("[Testcase 3: Upgrade contract]", () => {
    
  });
});