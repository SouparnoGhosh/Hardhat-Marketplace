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

        it("exclusively allows owners to list", async function () {
          nftMarketPlace = nftMarketPlaceContract.connect(user);
          await basicNft.approve(await user.getAddress(), TOKEN_ID);
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotOwner");
        });

        it("needs approvals to list item", async function () {
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotApprovedForMarketplace");
        });

        it("Updates listing with seller and price", async function () {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const listing = await nftMarketPlace.getListing(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() === PRICE.toString());
          assert(listing.seller.toString() === (await deployer.getAddress()));
        });
      });

      describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
          const error = `NotListed("${basicNft.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith(error);
        });

        it("reverts if anyone but the owner tries to call", async function () {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketPlace = nftMarketPlaceContract.connect(user);
          await basicNft.approve(await user.getAddress(), TOKEN_ID);
          await expect(
            nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NotOwner");
        });
      });
    });
