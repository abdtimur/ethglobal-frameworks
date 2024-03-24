/* eslint-disable react/jsx-key */
import { getFrameMessage } from "frames.js";
import { createFrames, Button } from "frames.js/next";

const frames = createFrames({
  initialState: {
    captchaId: "",
    valueHash: "",
  },
});

const handleRequest = frames(async (ctx) => {
  const requesterFid = ctx?.message?.requestedFid || null;
  // here is the home frame. We will need to go through home -> captcha -> frames to get to user's frames
  return {
    image: (
      <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
        <h1 tw="text-6xl font-bold text-start mr-10">Welcome to MeetFrames!</h1>
        <p tw="text-4xl py-0 text-start">
          This tool will help to sell your time and expertise in a new way.
        </p>
        <p tw="text-4xl py-0 text-start">
          Create a frame and allow your follower to bid for your time.
        </p>
        <p tw="text-2xl text-center">Use the button below to get started.</p>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/frames" }}>
        Let&apos;s go!
      </Button>,
    ],
    headers: {
      // Max cache age in seconds
      "Cache-Control": "max-age=0",
    },
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
