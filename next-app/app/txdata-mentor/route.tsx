import { TransactionTargetResponse } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getAddress,
  getContract,
  http,
  parseEther,
} from "viem";
import { baseSepolia } from "viem/chains";
import { MEETFRAMES_ADDRESS, MeetFramesAbi } from "../txdata/abi";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);
  console.log("Frame message", frameMessage);
  const state = JSON.parse(frameMessage?.state || "{}") as any;

  if (!frameMessage) {
    throw new Error("No frame message found");
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const meetFramesRegistry = getContract({
    address: MEETFRAMES_ADDRESS,
    abi: MeetFramesAbi,
    client: publicClient,
  });

  const currentFrameId = await meetFramesRegistry.read.getCurrentFrameId();
  const newFrameId = `frame-${currentFrameId}`;

  const txAddress =
    frameMessage.connectedAddress || frameMessage.requesterVerifiedAddresses[0];

  console.log("State is ", state);
  console.log("Frame ID is ", newFrameId);
  console.log("txAddress is ", txAddress);

  const calldata = encodeFunctionData({
    abi: MeetFramesAbi,
    functionName: "createFrame",
    args: [
      newFrameId,
      txAddress,
      state.mentorName,
      state.mentorProfile,
      state.sessionTitle,
      BigInt(state.fid),
      BigInt(state.closingTime),
      BigInt(state.targetTime),
      BigInt(state.minBid),
    ],
  });

  return NextResponse.json({
    chainId: "eip155:84532", // Base Sepolia chain
    method: "eth_sendTransaction",
    params: {
      abi: MeetFramesAbi as Abi,
      to: MEETFRAMES_ADDRESS,
      data: calldata,
      value: "0",
    },
  });
}
