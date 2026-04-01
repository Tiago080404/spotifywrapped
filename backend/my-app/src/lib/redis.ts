import { createClient } from "redis";

export const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export async function setCachingData(
  userId: string,
  data: object,
  time: number,
  timeRange: string,
  setting: string,
) {
  await client.set(
    `user:${userId}:${setting}:${timeRange}`,
    JSON.stringify(data),
    { EX: time },
  );
}
export async function getCachingData(
  userId: string,
  timeRange: string,
  setting: string,
) {
  console.log(userId, timeRange, setting);
  const res = await client.get(`user:${userId}:${setting}:${timeRange}`);
  if (!res) {
    return null;
  }
  return JSON.parse(res);
}
