import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Golden Path Tests", function () {
  async function deployMeetFrames() {
    // Contracts are deployed using the first signer/account by default
    const [owner, mentor, buyer, buyer2] = await ethers.getSigners();

    const MeetFrames = await ethers.getContractFactory("MeetFrames");
    const meetFramesContract = await (
      await MeetFrames.connect(owner).deploy()
    ).waitForDeployment();

    const testFrame1 = {
      frameId: "testFrame1",
      fid: 1,
      closingTime: new Date().getTime() + 1000 * 60 * 1, // 1 minute from now
      targetTime: new Date().getTime() + 1000 * 60 * 2, // 2 minutes from now
      minBid: ethers.parseEther("0.001"),
    };

    await meetFramesContract
      .connect(mentor)
      .createFrame(
        testFrame1.frameId,
        mentor.address,
        testFrame1.fid,
        testFrame1.closingTime,
        testFrame1.targetTime,
        testFrame1.minBid
      );

    return { meetFramesContract, testFrame1, owner, mentor, buyer, buyer2 };
  }

  describe("MeetFrames", function () {
    it("Should create a frame", async function () {
      const { meetFramesContract, testFrame1, mentor } = await loadFixture(
        deployMeetFrames
      );

      const frame = await meetFramesContract.getFrameConfig(
        mentor.address,
        testFrame1.frameId
      );
      expect(frame.fid).to.equal(testFrame1.fid);
      expect(frame.closingTime).to.equal(testFrame1.closingTime);
      expect(frame.targetTime).to.equal(testFrame1.targetTime);
      expect(frame.minBid).to.equal(testFrame1.minBid);
    });

    it("Should place a bid", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer } =
        await loadFixture(deployMeetFrames);

      await meetFramesContract
        .connect(buyer)
        .bidFrame(mentor.address, testFrame1.frameId, {
          value: ethers.parseEther("0.002"),
        });
      console.log(
        "Bid placed" +
          buyer.address +
          " " +
          testFrame1.frameId +
          " " +
          ethers.parseEther("0.002")
      );

      console.log(mentor.address + " " + testFrame1.frameId);
      const frameBid = await meetFramesContract.getFrameBid(
        testFrame1.frameId,
        buyer.address
      );
      expect(frameBid.bidder).to.equal(buyer.address);
      expect(frameBid.bid).to.equal(ethers.parseEther("0.002"));
    });

    it("Should not place a bid below minimum", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer } =
        await loadFixture(deployMeetFrames);

      await expect(
        meetFramesContract
          .connect(buyer)
          .bidFrame(mentor.address, testFrame1.frameId, {
            value: ethers.parseEther("0.0005"),
          })
      ).to.be.revertedWith("MeetFrames: bid is lower than winner bid");
    });

    it("Should not place a bid after closing time", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer } =
        await loadFixture(deployMeetFrames);

      // advance time to cutoff
      await time.increaseTo(testFrame1.closingTime + 1);
      await expect(
        meetFramesContract
          .connect(buyer)
          .bidFrame(mentor.address, testFrame1.frameId, {
            value: ethers.parseEther("0.002"),
          })
      ).to.be.revertedWith("MeetFrames: frame is closed");
    });

    // it should complete the frame
    it("Should complete the frame with 0 reward", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer } =
        await loadFixture(deployMeetFrames);

      // advance time to target time
      await time.increaseTo(testFrame1.targetTime + 1);
      const mentorBalanceBefore = await ethers.provider.getBalance(
        mentor.address
      );
      await meetFramesContract
        .connect(mentor)
        .completeFrame(testFrame1.frameId);
      const mentorBalanceAfter = await ethers.provider.getBalance(
        mentor.address
      );

      // approx equal - gas fees
      expect(
        Number(ethers.formatEther(mentorBalanceAfter)).toFixed(2)
      ).to.be.equal(Number(ethers.formatEther(mentorBalanceBefore)).toFixed(2));

      const frame = await meetFramesContract.getFrameConfig(
        mentor.address,
        testFrame1.frameId
      );
      expect(frame.completed).to.equal(true);
    });

    // it should complete the frame with reward
    it("Should complete the frame with reward", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer } =
        await loadFixture(deployMeetFrames);

      await meetFramesContract
        .connect(buyer)
        .bidFrame(mentor.address, testFrame1.frameId, {
          value: ethers.parseEther("0.002"),
        });

      // advance time to target time
      await time.increaseTo(testFrame1.targetTime + 1);
      const mentorBalanceBefore = await ethers.provider.getBalance(
        mentor.address
      );
      await meetFramesContract
        .connect(mentor)
        .completeFrame(testFrame1.frameId);
      const mentorBalanceAfter = await ethers.provider.getBalance(
        mentor.address
      );

      // approx equal - gas fees
      expect(
        Number(
          ethers.formatEther(mentorBalanceAfter - mentorBalanceBefore)
        ).toFixed(3)
      ).to.be.equal("0.002");

      const frame = await meetFramesContract.getFrameConfig(
        mentor.address,
        testFrame1.frameId
      );
      expect(frame.completed).to.equal(true);
    });

    // it should return the bid to previous bidder
    it("Should return the bid to previous bidder", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer, buyer2 } =
        await loadFixture(deployMeetFrames);

      await meetFramesContract
        .connect(buyer)
        .bidFrame(mentor.address, testFrame1.frameId, {
          value: ethers.parseEther("0.002"),
        });

      const firstBuyerBalanceBefore = await ethers.provider.getBalance(
        buyer.address
      );
      await meetFramesContract
        .connect(buyer2)
        .bidFrame(mentor.address, testFrame1.frameId, {
          value: ethers.parseEther("0.003"),
        });
      const firstBuyerBalanceAfter = await ethers.provider.getBalance(
        buyer.address
      );

      // approx equal - gas fees
      expect(
        Number(
          ethers.formatEther(firstBuyerBalanceAfter - firstBuyerBalanceBefore)
        ).toFixed(3)
      ).to.be.equal("0.002");

      const frameBid = await meetFramesContract.getFrameBid(
        testFrame1.frameId,
        buyer2.address
      );

      expect(frameBid.bidder).to.equal(buyer2.address);
      expect(frameBid.bid).to.equal(ethers.parseEther("0.003"));

      const frameConfig = await meetFramesContract.getFrameConfig(
        mentor.address,
        testFrame1.frameId
      );
      expect(frameConfig.winner).to.equal(buyer2.address);
      expect(frameConfig.completed).to.equal(false);
    });
  });
});
