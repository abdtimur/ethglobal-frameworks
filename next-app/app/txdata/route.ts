import { TransactionTargetResponse } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
  parseEther,
} from "viem";
import { optimism } from "viem/chains";
import { MeetFramesAbi } from "./abi";

const MEETFRAMES_ADDRESS = "0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);
  const frameId = frameMessage?.state?.frameId;

  if (!frameMessage || !frameId) {
    throw new Error("No frame message or frame ID found");
  }

  // Get current storage price
  const units = BigInt(parseEther(frameMessage.inputText || "0"));
  if (units <= 0) {
    throw new Error("Invalid bid amount");
  }

  const txAddress =
    frameMessage.connectedAddress || frameMessage.requesterVerifiedAddresses[0];
  const calldata = encodeFunctionData({
    abi: MeetFramesAbi,
    functionName: "bidFrame",
    args: [txAddress, frameId],
  });

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  const storageRegistry = getContract({
    address: MEETFRAMES_ADDRESS,
    abi: MeetFramesAbi,
    client: publicClient,
  });

  const unitPrice = (await storageRegistry.read.price([units])) as bigint;

  return NextResponse.json({
    chainId: "eip155:84532", // Base Sepolia chain
    method: "eth_sendTransaction",
    params: {
      abi: MeetFramesAbi as Abi,
      to: MEETFRAMES_ADDRESS,
      data: calldata,
      value: unitPrice.toString(),
    },
  });
}
