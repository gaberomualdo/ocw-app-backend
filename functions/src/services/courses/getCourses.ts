import algoliasearch from "algoliasearch";
import * as functions from "firebase-functions";

import { GenericObject, normalizeString } from "../../util";
import { ALGOLIA_COURSES_INDEX_NAME } from "../../util/constants";

const client = algoliasearch(
  functions.config().algolia.app_id,
  functions.config().algolia.admin_api_key
);
const index = client.initIndex(ALGOLIA_COURSES_INDEX_NAME);

export const getCourses = functions.https.onRequest(
  async (request: any, response: any) => {
    const filters: string[] = [];
    // apply query params
    let {
      filterBy,
      level,
      instructors,
      departments,
      semestersTaught,
      searchQuery,
      matchesCourseIDs,
      page,
      location,
    } = request.query;

    let pageNum = 1;
    if (page) {
      page = page.toString();
      if (!isNaN(parseInt(page))) pageNum = Math.max(1, parseInt(page));
    }
    console.log(pageNum);

    // filters
    switch (filterBy) {
      case "hasVideoLectures":
        filters.push("hasLectures:true");
        break;
      case "noVideoLectures":
        filters.push("hasLectures:false");
        break;
    }

    // matches courses
    if (matchesCourseIDs) {
      const courseIDs = matchesCourseIDs.toString().split(",");
      filters.push(
        `(${courseIDs
          .map((e: string) => `objectID:${JSON.stringify(e)}`)
          .join(" OR ")})`
      );
    }

    // search
    let searchQueryAsString = "";
    if (searchQuery)
      searchQueryAsString = normalizeString(searchQuery.toString());

    // find by
    if (level) filters.push(`level:${JSON.stringify(level)}`);
    if (departments) {
      departments
        .toString()
        .split(",")
        .forEach((e: string) =>
          filters.push(`department:${JSON.stringify(e)}`)
        );
    }
    if (instructors) {
      instructors
        .toString()
        .split(",")
        .forEach((e: string) =>
          filters.push(`instructors:${JSON.stringify(e)}`)
        );
    }
    if (semestersTaught) {
      semestersTaught
        .toString()
        .split(",")
        .forEach((e: string) =>
          filters.push(`semesterTaught:${JSON.stringify(e)}`)
        );
    }
    if (location) {
      const locationString = location.toString();
      filters.push(`locationsStrings:${JSON.stringify(locationString)}`);
    }

    let result: GenericObject = await index.search(searchQueryAsString, {
      filters: filters.join(" AND "),
      page: pageNum - 1, // Algolia pages are zero-indexed
      attributesToRetrieve: [
        "*", // retrieves all attributes
        "-lastmodified", // except this list of attributes (starting with a '-')
      ],
      attributesToHighlight: [],
    });

    if (!result.hits) result = { hits: [], nbPages: 1 };

    const { hits } = result;

    // move hit.objectID to hit.id
    hits.forEach((e: GenericObject) => {
      if (e.objectID && !e.id) {
        e.id = e.objectID;
        delete e.objectID;
      }
    });

    // alphabetize results for non-search
    if (!searchQuery) {
      hits.sort((a: any, b: any) => a.sortAs.localeCompare(b.sortAs));
    }
    // return
    const pageCount = Math.max(1, result.nbPages);
    response.json({ pageCount, courses: hits });
  }
);
