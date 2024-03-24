import { ethers, run } from "hardhat";

async function createFrame() {
  const [deployer] = await ethers.getSigners();

  const meetContract = await ethers.getContractAt(
    "MeetFrames",
    "0xd1e97BB35831c0F2ef4b9884500B554e76e5A1e4"
  );

  const frameInfo = {
    mentorName: "lolchto",
    mentorProfile: "https://warpcast.com/lolchto",
    sessionTitle: "Offline coffee break with Tim",
    fid: 1,
    closingTime: new Date().getTime() + 1000 * 60 * 60 * 24 * 7, // 7 days
    targetTime: new Date().getTime() + 1000 * 60 * 60 * 24 * 8, // 8 days
    minBid: ethers.parseEther("0.0001"),
  };

  const currentFrameId = await meetContract.getCurrentFrameId();
  const frameId = `frame-${currentFrameId}`;

  console.log(
    `Creating frame with info: ${frameId}. For account: ${deployer.address}`
  );

  const tx = await meetContract.createFrame(
    frameId,
    deployer.address,
    frameInfo.mentorName,
    frameInfo.mentorProfile,
    frameInfo.sessionTitle,
    frameInfo.fid,
    frameInfo.closingTime,
    frameInfo.targetTime,
    frameInfo.minBid
  );

  await tx.wait();
  console.log(`Frame created. Tx hash: ${tx.hash}`);

  console.log(`Done!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
createFrame().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
