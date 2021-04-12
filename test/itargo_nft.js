const ItargoNFT = artifacts.require("ItargoNFT");
const truffleAssert = require('truffle-assertions');
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

  beforeEach('should setup the contract instance', async () => {
    //각 테스트마다 contract배포
    //한 번만 배포하여 재사용하고 싶을 경우, await ItargoNft.deployed()
    instance = await ItargoNFT.new();
  });

  describe("[Testcase 1: check if the smart contract has been created as correct name]", () => {
    it("1.1. Is the token name the same as set in the constructor?", async function() {
      (await instance.name()).should.eq('ItargoNFT');
    });

    it("1.2. Is the token symbol is the same as set in the constructor?", async function() {
      (await instance.symbol()).should.eq('ITARGO NFT');
    });
  });

  describe("[Testcase 2: check if the mintNft function implemented work as intended]", () => {
    //contract creator만 호출할 수 있는지 확인
    it("2.1. Is this function only executed by the contract creator?", async () => {
      await truffleAssert.reverts(instance.lazyMint(accounts[2], "", {
        'from': accounts[1]
      }));
    });

    //1부터 시작하여 1씩 증가하는 tokenId를 발급하는지 확인
    //truffle test에서 mintNft return value가 uint256 type이 아닌 transaction object인 이유로 return되는 tokenId로는 비교하지 못함
    //token의 index(contract mapping 변수의 index)는 0부터 시작, tokenId는 1부터 시작
    it("2.2. Does this function issue token id that starts at 1 and increases by 1 each time it is called?", async () => {
      const first = new BigNumber(1);
      const second = new BigNumber(2);
      const third = new BigNumber(3);

      //#1
      await instance.mintNft(accounts[1], "woo-sung", {
        'from': accounts[0]
      });

      (await instance.tokenByIndex(0)).should.be.bignumber.equal(first);
      
      //#2
      await instance.mintNft(accounts[1], "wi-ju", {
        'from': accounts[0]
      });

      (await instance.tokenByIndex(1)).should.be.bignumber.equal(second);

      //#3. 같은 계좌로 한 번 더 mintNft call하였을 때, tokenId가 증가하여 발급되는지 확인
      await instance.mintNft(accounts[2], "ji-hoon", {
        'from': accounts[0]
      });

      (await instance.tokenByIndex(2)).should.be.bignumber.equal(third);
    });

    it("2.3. After calling this function, did the total supply of the token increase by 1?", async () => {
      const increaseSize = new BigNumber(1);
      let beforeSupply = await instance.totalSupply();

      await instance.mintNft(accounts[1], "", {
        'from': accounts[0]
      });

      (await instance.totalSupply()).should.be.bignumber.equal(beforeSupply.add(increaseSize));

      //같은 계좌로 한 번 더 mintNft call하였을 때, total supply가 1 증가하는지 확인
      beforeSupply = await instance.totalSupply();
      await instance.mintNft(accounts[1], "", {
        'from': accounts[0]
      });

      (await instance.totalSupply()).should.be.bignumber.equal(beforeSupply.add(increaseSize));
    });

    it("2.4. Did the receiver of this function become the owner of the token?", async () => {
      await instance.mintNft(accounts[1], "", {
        'from': accounts[0]
      });

      (await instance.ownerOf(1)).should.eq(accounts[1]);
    });

    it("2.5. Is the tokenURI of the token minted through this function well set?", async () => {
      await instance.mintNft(accounts[1], "itargo.io/chan", {
        'from': accounts[0]
      });

      (await instance.tokenURI(1)).should.eq('itargo.io/chan');
    });

    it("2.6. Is the contract creator approved address of minted token?", async () => {
      await instance.mintNft(accounts[1], "", {
        'from': accounts[0]
      });

      (await instance.getApproved(1)).should.eq(accounts[0]);
    });
  });

  describe("[Testcase 3: check if the transferNft function implemented work as intended]", () => {
    //contract creator만 호출할 수 있는지 확인
    it("3.1. Is this function only executed by the contract creator?", async () => {
      await instance.mintNft(accounts[1], "owner", {
        'from': accounts[0]
      });

      await truffleAssert.reverts(instance.transferNft(accounts[1], accounts[2], 1, {
        'from': accounts[3]
      }));
    });

    it("3.2. When trying to transferring using non-existent token id, is it properly reverted?", async () => {
      await instance.mintNft(accounts[1], "invalid tokenId", {
        'from': accounts[0]
      });

      await truffleAssert.reverts(instance.transferNft(accounts[1], accounts[2], 2, {
        'from': accounts[0]
      }));
    });

    it("3.3. When trying to transferring from an address that is not the owner, is it properly reverted?", async () => {
      await instance.mintNft(accounts[1], "invalid from address", {
        'from': accounts[0]
      });

      await truffleAssert.reverts(instance.transferNft(accounts[2], accounts[3], 1, {
        'from': accounts[0]
      }));
    });

    it("3.4. Is the contract creator still approved address of transferred token?", async () => {
      await instance.mintNft(accounts[1], "always approved address", {
        'from': accounts[0]
      });

      await instance.transferNft(accounts[1], accounts[2], 1, {
        'from': accounts[0]
      });

      (await instance.getApproved(1)).should.eq(accounts[0]);
    });

    it("3.5. test?", async () => {
      await instance.mintNft(accounts[1], "always approved address", {
        'from': accounts[0]
      });

      await instance.mintNft(accounts[4], "always approved address", {
        'from': accounts[0]
      });

      //2번 계좌가 approved하게 외부에서 셋팅
      await instance.setApprovalForAll(accounts[2], true, {
        'from': accounts[1]
      });

      await instance.safeTransferFrom(accounts[1], accounts[3], 1, {
        'from': accounts[2]
      })

      //진짜 다 approve한지?  ㄴㄴ. approve주어도 calle계좌에만 접근하는거임
      await instance.safeTransferFrom(accounts[4], accounts[3], 2, {
        'from': accounts[2]
      })

    });

  });

  //owner 아닌데 from address로 사용
  //두번 민트하고 밸런스오브 확인해서 2로 보이는지 확인
  //burn 도 랩핑 해서 구현해야 할지 논의
  //기타. event 확인. revert, throw확인. safeTransferFrom같은거 부를 수 있는지 확인

  describe("[Testcase 4: Check if the public functions of erc721 are a security concern]", () => {
    it("1.1. Is the token name the same as set in the constructor?", async function () {
      (await instance.name()).should.eq('ItargoNft');
    });

    it("4.1. test?", async () => {
      await instance.mintNft(accounts[1], "always approved address", {
        'from': accounts[0]
      });

      await instance.mintNft(accounts[4], "always approved address", {
        'from': accounts[0]
      });

      //2번 계좌가 approved하게 외부에서 셋팅
      await instance.setApprovalForAll(accounts[2], true, {
        'from': accounts[1]
      });

      await instance.safeTransferFrom(accounts[1], accounts[3], 1, {
        'from': accounts[2]
      })

      //진짜 다 approve한지?  ㄴㄴ. approve주어도 calle계좌에만 접근하는거임
      await instance.safeTransferFrom(accounts[4], accounts[3], 2, {
        'from': accounts[2]
      })

    });
  });

});
