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
import { baseSepolia, optimism } from "viem/chains";
import { MEETFRAMES_ADDRESS, MeetFramesAbi } from "../txdata/abi";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);
  console.log("Frame message", frameMessage);
  const frameId = JSON.parse(frameMessage?.state || "{}").frameId;
  const requesterFid = frameMessage?.requesterFid || null;

  if (!frameMessage || !frameId || !requesterFid) {
    throw new Error("No frame message or frame ID found");
  }

  const calldata = encodeFunctionData({
    abi: MeetFramesAbi,
    functionName: "completeFrame",
    args: [frameId],
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
