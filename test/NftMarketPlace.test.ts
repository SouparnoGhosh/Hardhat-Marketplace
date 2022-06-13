/* eslint-disable no-unused-expressions */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
import { Provider } from "@ethersproject/abstract-provider";
import { assert, expect } from "chai";
import { Signer } from "ethers";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { NftMarketPlace, BasicNft } from "../typechain";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
      let nftMarketPlace: NftMarketPlace,
        nftMarketPlaceContract: NftMarketPlace,
        basicNft: BasicNft;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;
      let deployer: Signer;
      let user: Signer;

      beforeEach(async () => {
        const accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketPlaceContract = await ethers.getContract("NftMarketPlace");
        nftMarketPlace = nftMarketPlaceContract.connect(deployer);
        basicNft = await ethers.getContract("BasicNft", deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketPlaceContract.address, TOKEN_ID);
      });

      describe("listItem", function () {
        it("emits an event after listing an item", async function () {
          expect(
            await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.emit(nftMarketPlace, "ItemListed");
        });

        it("exclusively items that haven't been listed", async function () {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith(error);
        });
      });
    });
