import { IVideo } from '@consumet/extensions';
import { ListAnimeData } from '@/types/anilistAPITypes';
import { animeCustomTitles } from '../animeCustomTitles';
import { getAvailableEpisodes, getParsedAnimeTitles } from '../utils';
import { getEpisodeUrl as animedrive } from './animedrive';
import { getEpisodeUrl as animeunity } from './animeunity';
import { getEpisodeUrl as gogoanime } from './gogoanime';
import { getEpisodeUrl as hianime } from './hianime';
import { getEpisodeUrl as aniwatch } from './aniwatch';


const API_BASE = '/api/anime'

export const fetchFromProvider = async (provider: string, type: string, query: string) => {
  const response = await fetch(`${API_BASE}/${provider}?type=${type}&query=${encodeURIComponent(query)}`)
  return response.json()
}

export const getUniversalEpisodeUrl = async (
  listAnimeData: ListAnimeData,
  episode: number,
): Promise<IVideo[] | null> => {
  const lang = localStorage.getItem('source_flag') || 'INT';
  const dubbed = localStorage.getItem('dubbed') === 'true';
  const customTitle = animeCustomTitles[lang] && animeCustomTitles[lang][listAnimeData.media?.id!];
  const animeTitles = getParsedAnimeTitles(listAnimeData.media);
  
  if (customTitle) {
    animeTitles.unshift(customTitle.title);
  }

  const providers = [
    {
      name: 'HiAnime',
      fetch: () => hianime(animeTitles, customTitle?.index || 0, episode, dubbed)
    },
    {
      name: 'Gogoanime',
      fetch: () => gogoanime(animeTitles, customTitle?.index || 0, episode, dubbed, listAnimeData.media.startDate?.year ?? 0)
    },
    {
      name: 'AnimeUnity',
      fetch: () => animeunity(animeTitles, customTitle?.index || 0, episode, dubbed, listAnimeData.media.startDate?.year ?? 0)
    },
    {
      name: 'AnimeDrive',
      fetch: () => animedrive(animeTitles, customTitle?.index || 0, episode, dubbed)
    },
    {
      name: 'AniWatch',
      fetch: () => aniwatch(listAnimeData.media.id?.toString() || '', episode)
    }
  ];

  for (const provider of providers) {
    try {
      const sources = await provider.fetch();
      if (sources && sources.length > 0) {
        console.log(`Found source from ${provider.name}`);
        return sources;
      }
    } catch (error) {
      console.error(`Failed to fetch from ${provider.name}:`, error);
    }
  }

  console.error('No working video sources found for:', {
    titles: animeTitles,
    episode,
    dubbed
  });

  return null;
}