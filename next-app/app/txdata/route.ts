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
import { MEETFRAMES_ADDRESS, MeetFramesAbi } from "./abi";

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

  // Get current storage price
  const bid = BigInt(parseEther(frameMessage.inputText || "0"));
  if (bid <= 0) {
    // TODO: Check on minimal bid as well
    throw new Error("Invalid bid amount");
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
  const currentWinnerBid = (await meetFramesRegistry.read.getFrameWinnerBid([
    frameId,
  ])) as bigint;
  console.log("Current winner bid", currentWinnerBid);
  if (bid <= currentWinnerBid) {
    throw new Error("Bid must be higher than the current winner");
  }

  const calldata = encodeFunctionData({
    abi: MeetFramesAbi,
    functionName: "bidFrame",
    args: [BigInt(requesterFid), frameId],
  });

  return NextResponse.json({
    chainId: "eip155:84532", // Base Sepolia chain
    method: "eth_sendTransaction",
    params: {
      abi: MeetFramesAbi as Abi,
      to: MEETFRAMES_ADDRESS,
      data: calldata,
      value: bid.toString(),
    },
  });
}
