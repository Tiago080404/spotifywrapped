type SpotifyTrackInput = {
  name: string;
  artist: string;
};

type SoundchartsSearchItem = {
  uuid: string;
  name?: string;
  creditName?: string;
};

type SoundchartsSearchResponse = {
  items?: SoundchartsSearchItem[];
};

type SoundchartsGenre = {
  root?: string;
  sub?: string[];
};

type SoundchartsSongResponse = {
  object?: {
    genres?: SoundchartsGenre[];
  };
};

export type GenreCount = {
  genre: string;
  count: number;
};

function getSoundchartsHeaders() {
  const appId =
    process.env.SOUNDCHARTS_APP_ID ||
    process.env.SOUNDCHARTSAPPID ||
    "soundcharts";
  const apiKey =
    process.env.SOUNDCHARTSKEY || process.env.SOUNDCHARTS_API_KEY || "";

  if (!apiKey) {
    throw new Error("Missing Soundcharts API key");
  }

  return {
    "x-app-id": appId,
    "x-api-key": apiKey,
  };
}

async function searchSongUuid(track: SpotifyTrackInput) {
  const query = `${track.name} ${track.artist}`.trim();
  const response = await fetch(
    `https://customer.api.soundcharts.com/api/v2/song/search/${encodeURIComponent(query)}?offset=0&limit=5`,
    {
      headers: getSoundchartsHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Soundcharts search failed with status ${response.status}`);
  }

  const data = (await response.json()) as SoundchartsSearchResponse;
  const items = data.items || [];

  return items[0]?.uuid || null;
}

async function fetchSongGenres(songUuid: string) {
  const response = await fetch(
    `https://customer.api.soundcharts.com/api/v2.25/song/${songUuid}`,
    {
      headers: getSoundchartsHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Soundcharts song fetch failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as SoundchartsSongResponse;
  return data.object?.genres || [];
}

export async function getTopGenresFromTracks(tracks: SpotifyTrackInput[]) {
  const counts = new Map<string, number>();
  let matchedSongs = 0;
  let tracksWithGenres = 0;

  console.log("[Genres] Soundcharts lookup start", {
    tracks: tracks.length,
    sampleTracks: tracks.slice(0, 3),
  });

  for (const track of tracks) {
    try {
      const songUuid = await searchSongUuid(track);

      if (!songUuid) {
        console.log("[Genres] no Soundcharts match", {
          trackName: track.name,
          artist: track.artist,
        });
        continue;
      }

      matchedSongs += 1;

      const genres = await fetchSongGenres(songUuid);
      const genresForSong = new Set<string>();

      for (const genre of genres) {
        if (genre.root) {
          genresForSong.add(genre.root.toLowerCase());
        }

        for (const subGenre of genre.sub || []) {
          if (subGenre) {
            genresForSong.add(subGenre.toLowerCase());
          }
        }
      }

      for (const genre of genresForSong) {
        counts.set(genre, (counts.get(genre) || 0) + 1);
      }

      if (genresForSong.size > 0) {
        tracksWithGenres += 1;
      } else {
        console.log("[Genres] song has no genres", {
          trackName: track.name,
          artist: track.artist,
          songUuid,
        });
      }
    } catch (error) {
      console.error("[Genres] Soundcharts genre lookup failed", {
        trackName: track.name,
        artist: track.artist,
        error,
      });
    }
  }

  console.log("[Genres] Soundcharts lookup summary", {
    inputTracks: tracks.length,
    matchedSongs,
    tracksWithGenres,
    uniqueGenres: counts.size,
  });

  return Array.from(counts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort(
      (first, second) =>
        second.count - first.count || first.genre.localeCompare(second.genre),
    );
}
