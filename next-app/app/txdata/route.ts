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

const MEETFRAMES_ADDRESS = "0x1234567890123456789012345678901234567890";

const meetFramesAbi = {};

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  // Get current storage price
  const units = BigInt(parseEther(frameMessage.inputText || '0'));
  if(units <= 0) {
    throw new Error("Invalid bid amount");
  }

  const calldata = encodeFunctionData({
    abi: meetFramesAbi as Abi,
    functionName: "bid",
    args: [BigInt(frameMessage.requesterFid), units],
  });

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  const storageRegistry = getContract({
    address: MEETFRAMES_ADDRESS,
    abi: meetFramesAbi as Abi,
    client: publicClient,
  });

  const unitPrice = (await storageRegistry.read.price([units])) as bigint;

  return NextResponse.json({
    chainId: "eip155:84532", // Base Sepolia chain
    method: "eth_sendTransaction",
    params: {
      abi: meetFramesAbi as Abi,
      to: MEETFRAMES_ADDRESS,
      data: calldata,
      value: unitPrice.toString(),
    },
  });
}
