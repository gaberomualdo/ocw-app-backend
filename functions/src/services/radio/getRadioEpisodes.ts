import * as functions from 'firebase-functions';

import {
  fetchJSON,
  GenericObject,
} from '../../util';

type Episode = {
  downloadURL: string;
  embedURL: string;
  title: string;
  description: string;
  publishedAt: string;
  durationSeconds: number;
};

export const getRadioEpisodes = functions.https.onRequest(async (request, response) => {
  const maxEpisodes = 1000000000; // 1 billion episodes; quite unlikely OCW will be publishing more than this number of episodes
  const episodesJSON = await fetchJSON(
    `https://api.simplecast.com/podcasts/2c64ace6-baf4-4e86-b527-445e611e6a31/episodes?status=published&limit=${maxEpisodes}&sort=desc`
  );
  const result: { [season: string]: Episode[] } = {};
  episodesJSON.collection.map((e: GenericObject) => {
    const key = `Season ${e.season.number}`;
    if (!result[key]) result[key] = [];
    result[key].push({
      downloadURL: e.enclosure_url,
      embedURL: e.href.replace('/episodes', '').replace('api.', 'player.') + '?hide_share=true',
      title: e.title,
      description: e.description,
      publishedAt: e.published_at,
      durationSeconds: e.duration,
    });
  });
  response.json(result);
});
