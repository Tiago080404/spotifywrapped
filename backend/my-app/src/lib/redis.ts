import { createClient } from "redis";

export const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export async function setCachingData(
  userId: string,
  data: object,
  time: number,
  timeRange: string,
) {
  await client.set(
    `user:${userId}:top-tracks:${timeRange}`,
    JSON.stringify(data),
    { EX: time },
  );
}
export async function getCachingData(userId: string, timeRange: string) {

  const res = await client.get(`user:${userId}:top-tracks:${timeRange}`);
  return JSON.parse(res);
}
