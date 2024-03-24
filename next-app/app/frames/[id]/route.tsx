/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";
import { getProperTimeLeftString } from "../../utils";
import { FrameConfig, getFrameBidFor, getFrameConfig } from "../../chain";
import { formatEther } from "viem";

const loadChainData = async (frameId: string) => {
  const config = await getFrameConfig(frameId);
  return {
    config,
  };
};

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  console.log(ctx);
  const pathParams = ctx?.url?.pathname.split("/").filter(Boolean);
  const frameId = pathParams[1]; // e.g. /frames/12345 -> 12345

  if (!frameId) {
    return {
      image: <span>Missing target frame ID</span>,
      buttons: [
        <Button action="post" target={{ pathname: "/meetframes" }}>
          Return to the main page
        </Button>,
      ],
    };
  }

  const { config } = await loadChainData(frameId);

  const timeLeft = getProperTimeLeftString(
    new Date(Number(config.closingTime)).getTime() - new Date().getTime()
  );

  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-4xl font-bold text-start mr-10">{config.sessionTitle}</h1>

        <div tw="flex flex-col justify-center text-3xl py-0 text-start">
          <div tw="flex text-2xl text-start font-black mb-4">
            When: {new Date(Number(config.targetTime)).toLocaleDateString()}
          </div>
          <div tw="flex text-2xl text-start font-black mb-4">
            Current event status: {config.completed ? "Completed" : "Active"}
          </div>
          {!config.completed && (
            <div tw="flex text-2xl text-start font-black mb-4">
              Closes in: {timeLeft}
            </div>
          )}
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: `/details/${frameId}` }}>
        More info
      </Button>,
      <Button action="post" target={{ pathname: `/meetframes` }}>
        Want the same tool?
      </Button>,
    ],
    headers: {
      "Cache-Control": "max-age=0",
    },
    state: {
      frameId: frameId,
    },
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
