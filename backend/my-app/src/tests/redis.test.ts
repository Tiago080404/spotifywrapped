import { beforeEach } from "node:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { client } from "../lib/redis.js";
import { getCachingData } from "../lib/cache.js";
vi.mock("../lib/redis", () => ({
  client: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe("get caching data", () => {
  it("gibt null zurück wenn kein cache vorhanden ist", async () => {
    vi.mocked(client.get).mockResolvedValue(null);
    const result = await getCachingData(
      "34wfsdfsd3",
      "short_term",
      "top-artists",
    );
    expect(result).toBeNull();
  });
  it("gibt geparste Daten zurück wenn Cache vorhanden", async () => {
    const fakeData = { tracks: ["song1", "song2"] };
    vi.mocked(client.get).mockResolvedValue(JSON.stringify(fakeData));
    const result = await getCachingData(
      "321rbwefsdh",
      "short_term",
      "top-tracks",
    );
    expect(result).toEqual(fakeData);
  });
  it("ruft den richtigen key ab", async () => {
    vi.mocked(client.get).mockResolvedValue(null);
    await getCachingData("dasfhsaz2123", "short_term", "top-tracks");
    expect(client.get).toHaveBeenCalledWith("user:dasfhsaz2123:top-tracks:short_term");

  });
});
