import { IVideo } from '@consumet/extensions';
import { ListAnimeData } from '@/types/anilistAPITypes';
import { animeCustomTitles } from '../animeCustomTitles';
import { getAvailableEpisodes, getParsedAnimeTitles } from '../utils';
import { getEpisodeUrl as gogoanime } from './gogoanime';
import { CachedLink } from '@/components/shared/cached-links'

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
      name: 'Gogoanime',
      fetch: async () => {
        const sources = await gogoanime(
          animeTitles, 
          customTitle?.index || 0, 
          episode, 
          dubbed, 
          listAnimeData.media.startDate?.year ?? 0
        );
        
        // Preload next chunk while current is playing
        if (sources?.[0]?.url) {
          sources.forEach(source => {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'fetch';
            preloadLink.href = source.url;
            document.head.appendChild(preloadLink);
          });
        }

        // if (episode < totalEpisodes) {
        //   getUniversalEpisodeUrl(listAnimeData, episode + 1);
        // }
        
        return sources?.sort((a, b) => {
          const qualityA = parseInt(a.quality?.replace('p', '') ?? '0');
          const qualityB = parseInt(b.quality?.replace('p', '') ?? '0');
          return qualityB - qualityA;
        });
      }
    }
  ];


  for (const provider of providers) {
    try {
      const sources = await provider.fetch();
      if (sources && sources.length > 0) {
        console.log(`Found ${sources.length} quality options from ${provider.name}`);
        return sources;
      }
    } catch (error) {
      console.error(`Failed to fetch from ${provider.name}:`, error);
      continue;
    }
  }

  return null;
}


