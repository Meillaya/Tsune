import { IVideo } from '@consumet/extensions';
import { ListAnimeData } from '../../types/anilistAPITypes';
import { animeCustomTitles } from '../animeCustomTitles';
import { getAvailableEpisodes, getEpisodes, getParsedAnimeTitles } from '../utils';
import { getEpisodeUrl as animedrive } from './animedrive';
import { getEpisodeUrl as animeunity } from './animeunity';
import { getEpisodeUrl as gogoanime } from './gogoanime';
import { getEpisodeUrl as hianime } from './hianime';

export const getUniversalEpisodeUrl = async (
  listAnimeData: ListAnimeData,
  episode: number,
): Promise<IVideo[] | null> => {
  if (!listAnimeData.media) {
    console.error('No media data provided');
    return null;
  }

  const dubbed = false; // Default to subbed version
  const lang = 'US'; // Default to US source
  const animeTitles = getParsedAnimeTitles(listAnimeData.media);
  const customTitle = animeCustomTitles[lang] && animeCustomTitles[lang][listAnimeData.media.id!];

  if (customTitle) {
    animeTitles.unshift(customTitle.title);
  }

  console.log('Searching with titles:', animeTitles);

  // Try each provider in sequence
  const providers = [
    {
      name: 'HiAnime',
      fn: () => hianime(animeTitles, customTitle ? customTitle.index : 0, episode, dubbed)
    },
    {
      name: 'Gogoanime',
      fn: () => gogoanime(
        animeTitles,
        customTitle ? customTitle.index : 0,
        episode,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0
      )
    },
    {
      name: 'AnimeUnity',
      fn: () => animeunity(
        animeTitles,
        customTitle ? customTitle.index : 0,
        episode,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0
      )
    },
    {
      name: 'AnimeDrive',
      fn: () => animedrive(animeTitles, customTitle ? customTitle.index : 0, episode, dubbed)
    }
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);
      const sources = await provider.fn();
      if (sources && sources.length > 0) {
        console.log(`Found sources from ${provider.name}`);
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