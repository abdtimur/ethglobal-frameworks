import { ethers, run } from "hardhat";

async function verify() {
  const contract = await ethers.getContractAt(
    "MeetFrames",
    "0xd1e97BB35831c0F2ef4b9884500B554e76e5A1e4"
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
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
