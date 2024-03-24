/* eslint-disable react/jsx-key */
import { getFrameMessage } from "frames.js";
import { createFrames, Button } from "frames.js/next";
import { getActiveFrames } from "../chain";

const frames = createFrames({
  initialState: {
    captchaId: "",
    valueHash: "",
  },
});

const handleRequest = frames(async (ctx) => {
  try {
    const body = await ctx.request.json();
    console.log(body);
    const frameMessage = await getFrameMessage(body);
    console.log(frameMessage);

    const username = frameMessage.requesterUserData?.username || null;

    const requesterFid = frameMessage.requesterFid || null;

    if (!frameMessage || !requesterFid) {
      throw new Error("No frame message or frame ID found");
    }

    // here should be contract request to get active frames
    const activeFrames = await getActiveFrames(requesterFid);
    console.log(activeFrames);

    return prepareFrameBody(username, activeFrames.length, activeFrames);
  } catch (e) {
    console.error(e);
    return {
      image: <span>{`Oops; Error:(`}</span>,
      buttons: [
        <Button action="post" target={{ pathname: "/meetframes" }}>
          Return to the main page
        </Button>,
      ],
    };
  }
});

const prepareFrameBody = (
  username: string | null,
  activeFrames: number,
  frameIds: string[]
) => {
  const aspectRatio: "1.91:1" = "1.91:1";
  const headers = {
    // Max cache age in seconds
    "Cache-Control": "max-age=0",
  };
  const headerText = `Let me see${username ? `, @${username}...` : "..."}`;
  const buttons = frameIds.map((id) => (
    <Button action="post" target={{ pathname: `/frames/${id}` }}>
      {id}
    </Button>
  ));
  switch (true) {
    case activeFrames > 3:
      return {
        image: (
          <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
            <h1 tw="text-6xl font-bold text-start mr-10">{headerText}</h1>
            <p tw="text-4xl py-0 text-start">
              Wow, you have a lot of active MeetFrames!
            </p>
            <p tw="text-4xl py-0 text-start">
              You will need to complete or cancel some of them before creating a
              new one. Since I can only show 4 at a time.
            </p>
            <p tw="text-4xl py-0 text-start">
              Use the buttons below to select your frames
            </p>
          </div>
        ),
        imageOptions: {
          aspectRatio,
        },
        buttons: buttons.slice(0, 4),
        headers,
      };
    case activeFrames > 0 && activeFrames < 4:
      return {
        image: (
          <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
            <h1 tw="text-6xl font-bold text-start mr-10">{headerText}</h1>
            <p tw="text-4xl py-0 text-start">
              Wow, you already have some active MeetFrames! 😏
            </p>
            <p tw="text-4xl py-0 text-start">
              You can check the status of your existing frames or create a new
              one
            </p>
          </div>
        ),
        imageOptions: {
          aspectRatio,
        },
        buttons: [
          <Button action="post" target={{ pathname: "/new-frame" }}>
            Create New Frame
          </Button>,
          ...buttons.slice(0, 3),
        ],
        headers,
      };
    case activeFrames === 0:
    default:
      return {
        image: (
          <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
            <h1 tw="text-6xl font-bold text-start mr-10">{headerText}</h1>
            <p tw="text-4xl py-0 text-start">
              I see, you have no active MeetFrames yet!
            </p>
            <p tw="text-4xl py-0 text-start">
              Making a MeetFrame is as easy as 1-2-3-4 steps
            </p>
            <p tw="text-4xl py-0 text-start">
              Use the button below to get started
            </p>
          </div>
        ),
        imageOptions: {
          aspectRatio,
        },
        buttons: [
          <Button action="post" target={{ pathname: "/new-frame" }}>
            Let's build your first MeetFrame
          </Button>,
        ],
        headers,
      };
  }
};

export const POST = handleRequest;
