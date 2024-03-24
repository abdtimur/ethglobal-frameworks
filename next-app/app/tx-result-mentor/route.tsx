/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  if (ctx.message?.transactionId) {
    return {
      image: (
        <div tw="relative flex min-w-screen min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12">
          <h1 tw="text-4xl font-bold text-start mr-10">
            Transaction submitted!
          </h1>

          <div tw="flex flex-col justify-center text-3xl py-0 text-start">
            <p tw="text-2xl py-0 text-start whitespace-pre-line">
              Your transaction ID is:
            </p>
            <div tw="flex text-2xl text-start font-black mb-4">
              {ctx.message.transactionId}
            </div>
            <span tw="text-2xl text-start">
              Please wait for tx to confirm and return to the home page to check
              the available frames.
            </span>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" target={{ pathname: `/frames` }}>
          Return to the home page
        </Button>,
        <Button
          action="link"
          target={`https://sepolia.basescan.org/tx/${ctx.message.transactionId}`}
        >
          View on block explorer
        </Button>,
      ],
    };
  } else {
    return {
      image: <span>{`Missing transaction ID... :(`}</span>,
      buttons: [
        <Button action="post" target={{ pathname: "/frames" }}>
          Return to the main page
        </Button>,
      ],
    };
  }
});

export const POST = handleRequest;
