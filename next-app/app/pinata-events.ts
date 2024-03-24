import { getPinataDate } from "./utils";

export const getFcUser = async (fid: string) => {
  const response = await fetch(
    `https://api.pinata.cloud/v3/farcaster/users/${fid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to get pinata user", response.statusText);
    return null;
  }

  return response.json().then((data) => data.data as PinataFcUser);
};

export const sendPinataEvent = async (
  frameId: string,
  customId: string,
  alldata: any
) => {
  const data = {
    trustedData: {
      messageBytes: alldata?.trustedData?.messageBytes ?? undefined,
    },
    untrustedData: {
      buttonIndex: alldata?.untrustedData?.buttonIndex ?? undefined,
      castId: {
        fid: alldata?.untrustedData?.castId?.fid ?? undefined,
        hash: alldata?.untrustedData?.castId?.hash ?? undefined,
      },
      fid: alldata?.untrustedData?.fid ?? undefined,
      inputText: alldata?.untrustedData?.inputText ?? undefined,
      messageHash: alldata?.untrustedData?.messageHash ?? undefined,
      network: alldata?.untrustedData?.network ?? undefined,
      timestamp: alldata?.untrustedData?.timestamp ?? undefined,
      url: alldata?.untrustedData?.url ?? undefined,
    },
  };

  console.log("Sending pinata event: ", JSON.stringify(data));

  const response = await fetch(
    "https://api.pinata.cloud/farcaster/frames/interactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        frame_id: frameId,
        custom_id: customId,
        data: data,
      }),
    }
  );

  if (!response.ok) {
    // do not throw an error here, as this is a non-critical operation
    console.error("Failed to send pinata event", response.statusText);
  }
  console.log(
    `Sent pinata event: for frame ${frameId} with custom id ${customId}. Response: ${response.statusText}`
  );
};

export const readPinataInteractions = async (
  frameId: string,
  customId: string
) => {
  // 1 month ago
  const startDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);
  const endDate = new Date();
  const params = new URLSearchParams({
    frame_id: frameId,
    custom_id: customId,
    start_date: getPinataDate(startDate), // YYYY-MM-DD HH:MM:SS
    end_date: getPinataDate(endDate), // YYYY-MM-DD HH:MM:SS
  });
  const response = await fetch(
    `https://api.pinata.cloud/farcaster/frames/interactions?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    }
  );

  if (!response.ok) {
    // do not throw an error here, as this is a non-critical operation
    console.error("Failed to read pinata interactions", response.statusText);
    return null;
  }

  return response.json() as Promise<PinataInteractionsResponse>;
};

export type PinataInteractionsResponse = {
  // consider adding time periods later
  total_interactions: number;
  total_unique_interactions: number;
};

export type PinataFcUser = {
  fid: number;
  custody_address: string;
  recovery_address: string;
  following_count: number;
  follower_count: number;
  verifications: string[];
  bio: string;
  display_name: string;
  pfp_url: string;
  username: string;
};
