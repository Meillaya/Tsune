import { History, AnimeHistoryEntry, EpisodeHistoryEntry, HistoryEntries } from "../types/historyTypes";

let history: History = (typeof localStorage !== 'undefined' && localStorage.getItem('history')) ? JSON.parse(localStorage.getItem('history') || '{}') : { entries: {} };

/** * Get the history entry for the anime's id.
 *
 * @param animeId
 * @returns anime history
 */
export const getAnimeHistory = (
  animeId: number
): AnimeHistoryEntry | undefined => history.entries[animeId];

/**
 * Get all entries from local history.
 *
 * @returns history entries
 */
export const getHistoryEntries = (): HistoryEntries => history.entries;

/**
 * Get local history.
 *
 * @returns local history.
 */
export const getHistory = (): History => history;

/**
 * Get history entry for a specific episode
 *
 * @param animeId
 * @param episodeNumber
 * @returns history entry
 */
export const getEpisodeHistory = (
  animeId: number,
  episodeNumber: number
): EpisodeHistoryEntry | undefined => getAnimeHistory(animeId)?.history[episodeNumber]


/**
 * Set local history.
 *
 * @param newHistory
 */
export const setHistory = (
  newHistory: History
) => {
  history = newHistory;
  localStorage.setItem('history', JSON.stringify(newHistory));
}

/**
 * Update the anime's entry
 *
 * @param animeHistory
 */
export const setAnimeHistory = (
  animeHistory: AnimeHistoryEntry
) => {
  const listAnimeData = animeHistory.data;
  const animeId = (listAnimeData.media.id || listAnimeData.media.mediaListEntry && listAnimeData.media.mediaListEntry.id) as number

  history.entries[animeId] = animeHistory;

  localStorage.setItem('history', JSON.stringify(history));
}
/**
 * Get the last watched episode from an anime.
 *
 * @param animeId
 * @returns last watched episode
 */
export const getLastWatchedEpisode = (
  animeId: number
): EpisodeHistoryEntry | undefined => {
  const animeHistory = getAnimeHistory(animeId) as AnimeHistoryEntry;

  if(animeHistory === undefined)
    return;

  return Object.values(animeHistory?.history).reduce((latest, current) => {
    return current.timestamp > latest.timestamp ? current : latest;
  }, Object.values(animeHistory.history)[0]);
}