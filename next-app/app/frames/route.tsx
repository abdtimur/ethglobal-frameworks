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

  try {
    const body = await ctx.request.json();
    console.log(body);
    const frameMessage = await getFrameMessage(body);
    console.log(frameMessage);

    const username = frameMessage.requesterUserData?.username || null;

    const requesterAddress =
      frameMessage.connectedAddress ||
      frameMessage.requesterVerifiedAddresses[0];

    // here should be contract request to get active frames
    const activeFrames = 0;

    return prepareFrameBody(username, activeFrames, ["1", "2", "3", "4"]);
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
  const headerText = `Let me see
    ${username ? `, @${username}...` : "..."}`;
  const buttons = frameIds.map((id) => (
    <Button action="post" target={{ pathname: `/frames/${id}` }}>
      {id}
    </Button>
  ));
  switch (true) {
    case activeFrames > 3:
      return {
        image: (
          <div tw="flex flex-col justify-items-center bg-white">
            <h1 tw="text-xs font-bold text-center">{headerText}</h1>
            <p tw="text-xs text-center">
              Wow, you have a lot of active MeetFrames!
            </p>
            <p tw="text-xs text-center">
              You will need to complete or cancel some of them before creating a
              new one. Since I can only show 4 at a time.
            </p>
            <p tw="text-xs text-center">
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
          <div tw="flex flex-col justify-items-center bg-white">
            <h1 tw="text-xs font-bold text-center">{headerText}</h1>
            <p tw="text-xs text-center">
              Wow, you already have some active MeetFrames!
            </p>
            <p tw="text-xs text-center">
              You can check the status of your existing frames or create a new
              one
            </p>
            <p tw="text-xs text-center">Use the buttons below to proceed</p>
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
          <div tw="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
            <h1 tw="text-xs font-bold text-center">{headerText}</h1>
            <p tw="text-xs text-center">
              I see, you have no active MeetFrames yet!
            </p>
            <p tw="text-xs text-center">
              Making a MeetFrame is as easy as 1-2-3-4-mint steps
            </p>
            <p tw="text-xs text-center">Use the button below to get started</p>
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
