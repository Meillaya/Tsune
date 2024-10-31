import { IVideo } from '@consumet/extensions';

const API_BASE = 'https://aniwatch-api.vercel.app';

export const getEpisodeUrl = async (
  animeId: string,
  episode: number,
): Promise<IVideo[] | null> => {
  try {
    // Get episode ID
    const episodeResponse = await fetch(
      `${API_BASE}/anime/episodes/${animeId}`
    );
    const episodeData = await episodeResponse.json();
    
    if (!episodeData?.episodes?.[episode - 1]?.id) {
      return null;
    }

    const episodeId = episodeData.episodes[episode - 1].id;

    // Get sources
    const sourcesResponse = await fetch(
      `${API_BASE}/anime/episode-srcs?id=${episodeId}`
    );
    const sourcesData = await sourcesResponse.json();

    if (!sourcesData?.sources?.length) {
      return null;
    }

    return sourcesData.sources.map((source: any) => ({
      url: source.url,
      isM3U8: source.url.includes('.m3u8'),
      quality: source.quality || 'unknown'
    }));

  } catch (error) {
    console.error('AniWatch API error:', error);
    return null;
  }
}