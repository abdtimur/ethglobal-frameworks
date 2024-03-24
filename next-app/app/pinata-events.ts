const JWT =
  "";
export const getFcUser = async (fid: string) => {
  const response = await fetch(
    `https://api.pinata.cloud/v3/farcaster/users/${fid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
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
  data: any
) => {
  const response = await fetch(
    "https://api.pinata.cloud/farcaster/frames/interactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        frame_id: frameId,
        custom_id: customId,
        data: {
          trustedData: data.trustedData,
          untrustedData: data.untrustedData,
        },
      }),
    }
  );

  if (!response.ok) {
    // do not throw an error here, as this is a non-critical operation
    console.error("Failed to send pinata event", response.statusText);
  }
};

export const readPinataInteractions = async (
  frameId: string,
  customId: string
) => {
  const response = await fetch(
    `https://api.pinata.cloud/farcaster/frames/interactions?frame_id=${frameId}&custom_id=${customId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
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
