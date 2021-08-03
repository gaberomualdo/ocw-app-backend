import * as functions from 'firebase-functions';

import {
  fetchHTML,
  findURLsInText,
  removeUselessWhitespace,
} from '../../util';

type Article = {
  title: string;
  description: string;
  imageURL: string;
  url: string;
};

const getBackgroundImageURLFromStyle = (style: string) => {
  const urls = findURLsInText(style);
  if (urls.length > 0) return urls[0];
  return '';
};

const fetchBlogPosts = async (pageNumber: number) => {
  if (pageNumber <= 0) pageNumber = 1;
  let url;
  if (pageNumber === 1) {
    url = 'https://www.ocw-openmatters.org/';
  } else {
    url = `https://www.ocw-openmatters.org/page/${pageNumber}/`;
  }

  const document = await fetchHTML(url);

  // get page count
  let pageCount;
  {
    const pageCountElement = document.querySelector('.page-number');
    if (!pageCountElement) return [];
    try {
      pageCount = parseInt(removeUselessWhitespace(pageCountElement.textContent || '').split(' ')[3]);
    } catch (err) {
      return [];
    }
  }
  if (pageNumber > pageCount) return [];

  // get articles
  const articles: Article[] = [];
  document.querySelectorAll('article').forEach((articleElement: any) => {
    const headerElement = articleElement.querySelector('header h1 a');
    const imageElement = articleElement.querySelector('[role="img"]');
    const descriptionElement = articleElement.querySelector('.post-excerpt');
    if (!headerElement || !imageElement || !descriptionElement) return;
    const article = {
      title: headerElement.textContent || '',
      imageURL: getBackgroundImageURLFromStyle(imageElement.getAttribute('style') || ''),
      url: headerElement?.getAttribute('href') || '',
      description: descriptionElement.textContent || 'No description for this article was provided.',
    };
    if (
      !article.title ||
      !article.imageURL ||
      !article.url ||
      article.title.length === 0 ||
      article.url.length === 0 ||
      article.imageURL.length === 0
    )
      return;
    articles.push(article);
  });
  return { articles, pageCount };
};

const fallbackNumber = (number: number, fallback: number): number => {
  if (number && !isNaN(number)) {
    return number;
  } else {
    return fallback;
  }
};

export const getRadioEpisodes = functions.https.onRequest(async (request, response) => {
  let { page } = request.query;
  if (!page) page = '1';
  const pageNumber = fallbackNumber(parseInt(page.toString()), 1);
  const results = await fetchBlogPosts(pageNumber);
  response.json(results);
});
