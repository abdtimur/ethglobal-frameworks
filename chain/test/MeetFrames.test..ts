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

    const mentorFid = 1;
    const buyerFid = 2;
    const buyer2Fid = 3;

    const MeetFrames = await ethers.getContractFactory("MeetFrames");
    const meetFramesContract = await (
      await MeetFrames.connect(owner).deploy()
    ).waitForDeployment();

    const currentFrameId = await meetFramesContract.getCurrentFrameId();

    expect(currentFrameId).to.equal(0);

    const testFrame1 = {
      frameId: `frame-${currentFrameId}`,
      mentorName: "lolchto",
      mentorProfile: "https://warpcast.com/lolchto",
      sessionTitle: "Offline coffee break with Tim",
      fid: mentorFid,
      closingTime: new Date().getTime() + 1000 * 60 * 1, // 1 minute from now
      targetTime: new Date().getTime() + 1000 * 60 * 2, // 2 minutes from now
      minBid: ethers.parseEther("0.001"),
    };

    await meetFramesContract
      .connect(mentor)
      .createFrame(
        testFrame1.frameId,
        mentor.address,
        testFrame1.mentorName,
        testFrame1.mentorProfile,
        testFrame1.sessionTitle,
        testFrame1.fid,
        testFrame1.closingTime,
        testFrame1.targetTime,
        testFrame1.minBid
      );

    const activeCount = await meetFramesContract.getActiveFramesCount(
      mentorFid
    );
    console.log(activeCount);

    const activeFrames = await meetFramesContract.getActiveFrames(mentorFid);
    console.log(activeFrames.length);

    const frameId1 = activeFrames[0];
    console.log(`Frame ID: ${frameId1}`);

    return {
      meetFramesContract,
      testFrame1,
      owner,
      mentor,
      mentorFid,
      buyer,
      buyerFid,
      buyer2,
      buyer2Fid,
      frameId1,
    };
  }

  describe("MeetFrames", function () {
    it("Should create a frame", async function () {
      const { meetFramesContract, testFrame1, mentor, frameId1 } =
        await loadFixture(deployMeetFrames);

      const frame = await meetFramesContract.getFrameConfig(testFrame1.frameId);
      expect(frameId1).to.equal(testFrame1.frameId);
      expect(frame.mentor).to.equal(mentor.address);
      expect(frame.fid).to.equal(testFrame1.fid);
      expect(frame.closingTime).to.equal(testFrame1.closingTime);
      expect(frame.targetTime).to.equal(testFrame1.targetTime);
      expect(frame.mentorName).to.equal(testFrame1.mentorName);
      expect(frame.mentorProfile).to.equal(testFrame1.mentorProfile);
      expect(frame.sessionTitle).to.equal(testFrame1.sessionTitle);
      expect(frame.minBid).to.equal(testFrame1.minBid);
    });

    it("Should place a bid", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer, buyerFid } =
        await loadFixture(deployMeetFrames);

      await meetFramesContract
        .connect(buyer)
        .bidFrame(buyerFid, testFrame1.frameId, {
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
        buyerFid
      );
      expect(frameBid.bidder).to.equal(buyer.address);
      expect(frameBid.bid).to.equal(ethers.parseEther("0.002"));
    });

    it("Should not place a bid below minimum", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer, buyerFid } =
        await loadFixture(deployMeetFrames);

      await expect(
        meetFramesContract
          .connect(buyer)
          .bidFrame(buyerFid, testFrame1.frameId, {
            value: ethers.parseEther("0.0005"),
          })
      ).to.be.revertedWith("MeetFrames: bid is lower than winner bid");
    });

    it("Should not place a bid after closing time", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer, buyerFid } =
        await loadFixture(deployMeetFrames);

      // advance time to cutoff
      await time.increaseTo(testFrame1.closingTime + 1);
      await expect(
        meetFramesContract
          .connect(buyer)
          .bidFrame(buyerFid, testFrame1.frameId, {
            value: ethers.parseEther("0.002"),
          })
      ).to.be.revertedWith("MeetFrames: frame is closed");
    });

    // it should complete the frame
    it("Should complete the frame with 0 reward", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer, buyerFid } =
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

      const frame = await meetFramesContract.getFrameConfig(testFrame1.frameId);
      expect(frame.completed).to.equal(true);
    });

    // it should complete the frame with reward
    it("Should complete the frame with reward", async function () {
      const { meetFramesContract, testFrame1, mentor, buyer, buyerFid } =
        await loadFixture(deployMeetFrames);

      await meetFramesContract
        .connect(buyer)
        .bidFrame(buyerFid, testFrame1.frameId, {
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

      const frame = await meetFramesContract.getFrameConfig(testFrame1.frameId);
      expect(frame.completed).to.equal(true);
    });

    // it should return the bid to previous bidder
    it("Should return the bid to previous bidder", async function () {
      const {
        meetFramesContract,
        testFrame1,
        mentor,
        buyer,
        buyer2,
        buyerFid,
        buyer2Fid,
      } = await loadFixture(deployMeetFrames);

      await meetFramesContract
        .connect(buyer)
        .bidFrame(buyerFid, testFrame1.frameId, {
          value: ethers.parseEther("0.002"),
        });

      const firstBuyerBalanceBefore = await ethers.provider.getBalance(
        buyer.address
      );
      await meetFramesContract
        .connect(buyer2)
        .bidFrame(buyer2Fid, testFrame1.frameId, {
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
        buyer2Fid
      );

      expect(frameBid.bidder).to.equal(buyer2.address);
      expect(frameBid.bidderFid).to.equal(buyer2Fid);
      expect(frameBid.bid).to.equal(ethers.parseEther("0.003"));

      const frameConfig = await meetFramesContract.getFrameConfig(
        testFrame1.frameId
      );
      expect(frameConfig.winner).to.equal(buyer2Fid);
      expect(frameConfig.winnerBid).to.equal(ethers.parseEther("0.003"));
      expect(frameConfig.completed).to.equal(false);
    });
  });
});
