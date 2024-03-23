import { ethers, run } from "hardhat";

async function verify() {
  const contract = await ethers.getContractAt(
    "MeetFrames",
    "0x722F7a61d1a58d22bcEA95184a4FAadEe955F689"
  );

  await run("verify:verify", {
    address: contract.target,
    constructorArguments: [],
  });
  console.log("Verified!");
}

async function main() {
  console.log("Deploying contracts...");

  const MeetFrames = await ethers.getContractFactory("MeetFrames");
  const meetFramesContract = await (
    await MeetFrames.deploy()
  ).waitForDeployment();

  console.log("MeetFrames deployed to:", meetFramesContract.target);

  console.log(`Done!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
