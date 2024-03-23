/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  const requesterFid = ctx?.message?.requestedFid || null;

  return {
    // Welcome to MeetFrames, @farcasterNick!
    // This is your tool to sell your time and expertise in a new way.
    // Create a frame and allow your follower to bid for your time.
    // Use the button below to get started.
    image: (
      <div tw="flex flex-col justify-items-center bg-white">
        <h1 tw="text-4xl font-bold text-center">
          Welcome to MeetFrames, @farcasterNick!
        </h1>
        <p tw="text-lg text-center">
          This is your tool to sell your time and expertise in a new way.
        </p>
        <p tw="text-lg text-center">
          Create a frame and allow your follower to bid for your time.
        </p>
        <p tw="text-lg text-center">Use the button below to get started.</p>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button action="post" target={{ pathname: "/mentors" }}>
        Here will be getting started
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
