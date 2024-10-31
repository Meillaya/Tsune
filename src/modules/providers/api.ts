import { IVideo } from '@consumet/extensions';


import { ListAnimeData } from '../../types/anilistAPITypes';
import { animeCustomTitles } from '../animeCustomTitles';
import { getAvailableEpisodes, getEpisodes, getParsedAnimeTitles } from '../utils';
import { getEpisodeUrl as animedrive } from './animedrive';
import { getEpisodeUrl as animeunity } from './animeunity';
// import { getEpisodeUrl as monoschinos } from './monoschinos';
import { getEpisodeUrl as gogoanime } from './gogoanime';
import { getEpisodeUrl as hianime } from './hianime';



/**
 * Gets the episode url and isM3U8 flag, with stored language and dubbed
 *
 * @param listAnimeData
 * @param episode
 * @returns
 */
export const getUniversalEpisodeUrl = async (
  listAnimeData: ListAnimeData,
  episode: number,
): Promise<IVideo | null> => {
  const lang = (await localStorage.getItem('source_flag')) as string;
  const dubbed = (await localStorage.getItem('dubbed')) as unknown as boolean;

  const customTitle = animeCustomTitles[lang] && animeCustomTitles[lang][listAnimeData.media?.id!];

  const animeTitles = getParsedAnimeTitles(listAnimeData.media);
  if (customTitle) animeTitles.unshift(customTitle.title);

  console.log(lang + ' ' + dubbed + ' ' + customTitle?.title);

  switch (lang) {
    case 'INT': {
      const data = await hianime(
        animeTitles,
        customTitle ? customTitle.index : 0,
        episode,
        dubbed
      );

      return data ? getDefaultQualityVideo(data) : null;
    }
    case 'US': {
      const data = await gogoanime(
        animeTitles,
        customTitle ? customTitle.index : 0,
        episode,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
      return data ? getDefaultQualityVideo(data) : null;
    }
    case 'IT': {
      const data = await animeunity(
        animeTitles,
        customTitle ? customTitle.index : 0,
        episode,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
      return data ? getDefaultQualityVideo(data) : null;
    }
    // case 'ES': {
    //   const data = await monoschinos(
    //     animeTitles,
    //     customTitle ? customTitle.index : 0,
    //     episode,
    //     dubbed,
    //     listAnimeData.media.startDate?.year ?? 0,
    //     getAvailableEpisodes(listAnimeData.media) ?? undefined
    //   );
    //   return data ? getDefaultQualityVideo(data) : null;
    // }
    case 'HU': {
      const data = await animedrive(
        animeTitles,
        customTitle ? customTitle.index : 0,
        episode,
        dubbed,
      );
      return data ? getDefaultQualityVideo(data) : null;
    }
  }

  return null;
};

export const getDefaultQualityVideo = (videos: IVideo[]): IVideo =>
  videos.find((video) => video.quality === 'default') ??
  getBestQualityVideo(videos);

export const getBestQualityVideo = (videos: IVideo[]): IVideo => {
  const qualityOrder = ['1080p', '720p', '480p', '360p', 'default', 'backup'];

  videos.sort((a, b) => {
    const indexA = qualityOrder.indexOf(a.quality || 'default');
    const indexB = qualityOrder.indexOf(b.quality || 'default');

    if (indexA < indexB) return -1;
    if (indexA > indexB) return 1;
    return 0;
  });

  return videos[0];
};