function getSoundchartsHeaders() {
    const appId = process.env.SOUNDCHARTS_APP_ID ||
        process.env.SOUNDCHARTSAPPID ||
        "soundcharts";
    const apiKey = process.env.SOUNDCHARTSKEY || process.env.SOUNDCHARTS_API_KEY || "";
    if (!apiKey) {
        throw new Error("Missing Soundcharts API key");
    }
    return {
        "x-app-id": appId,
        "x-api-key": apiKey,
    };
}
async function searchSongUuid(track) {
    const query = `${track.name} ${track.artist}`.trim();
    const response = await fetch(`https://customer.api.soundcharts.com/api/v2/song/search/${encodeURIComponent(query)}?offset=0&limit=5`, {
        headers: getSoundchartsHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Soundcharts search failed with status ${response.status}`);
    }
    const data = (await response.json());
    const items = data.items || [];
    return items[0]?.uuid || null;
}
async function fetchSongGenres(songUuid) {
    const response = await fetch(`https://customer.api.soundcharts.com/api/v2.25/song/${songUuid}`, {
        headers: getSoundchartsHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Soundcharts song fetch failed with status ${response.status}`);
    }
    const data = (await response.json());
    return data.object?.genres || [];
}
export async function getTopGenresFromTracks(tracks) {
    const counts = new Map();
    let matchedSongs = 0;
    let tracksWithGenres = 0;
    for (const track of tracks) {
        try {
            const songUuid = await searchSongUuid(track);
            if (!songUuid) {
                continue;
            }
            matchedSongs += 1;
            const genres = await fetchSongGenres(songUuid);
            const genresForSong = new Set();
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
            }
        }
        catch (error) {
            console.error("[Genres] Soundcharts genre lookup failed", {
                trackName: track.name,
                artist: track.artist,
                error,
            });
        }
    }
    return Array.from(counts.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((first, second) => second.count - first.count || first.genre.localeCompare(second.genre));
}
