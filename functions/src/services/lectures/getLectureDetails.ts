import * as functions from "firebase-functions";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import urljoin = require("url-join");

import Lecture from "../../models/Lecture";
import {
  fetchHTML,
  findURLsInText,
  getInnermostParent,
  parseURL,
} from "../../util";

export const getLectureDetails = functions.https.onRequest(
  async (request, response) => {
    let { url, title, thumbnailURL, courseID } = request.query;
    if (!url || !title || !request.query.lectureIndex || !thumbnailURL) {
      response.status(404).json({
        message: "Lecture not found or insufficient parameters provided",
      });
      return;
    }

    const lectureIndex = parseInt(request.query.lectureIndex.toString()) || 0;
    url = url.toString();
    title = title.toString();
    thumbnailURL = thumbnailURL.toString();

    let lectureNotesURL = "";
    let aboutHTML = "";
    let videoURL = "";

    // Fetches instructors list, which is not currently part of Lecture objects.
    // let instructors;
    // instructors = Array.from(document.querySelectorAll('meta[name="Author"]'))
    //   .map((e) => removeUselessWhitespace(e.getAttribute('content') || ''))
    //   .filter((e) => e.length > 0);

    {
      const documentHTML = await (await fetch(url)).text();
      const document = new JSDOM(documentHTML).window.document;

      // aboutHTML
      const aboutParentElement = document.querySelector("#vid_about");
      if (aboutParentElement) {
        const aboutInnermostParentElement: any =
          getInnermostParent(aboutParentElement);
        if (aboutInnermostParentElement.innerHTML) {
          aboutHTML = aboutInnermostParentElement.innerHTML;
        } else {
          aboutHTML = aboutInnermostParentElement.textContent;
        }
      } else {
        aboutHTML =
          document
            .querySelector('meta[name="Description"]')
            ?.getAttribute("content") ||
          "No description for this lecture was provided.";
      }

      // lecture notes
      try {
        const lectureNotesIndexURL = urljoin(url, "../../lecture-notes/");
        const lectureNotesIndexDocument = await fetchHTML(lectureNotesIndexURL);
        let lectureNotesPath;
        if (
          lectureNotesIndexDocument.querySelectorAll(
            "#course_inner_section .maintabletemplate table"
          )
        ) {
          lectureNotesPath = lectureNotesIndexDocument
            .querySelectorAll(
              `#course_inner_section .maintabletemplate table td:nth-child(${
                lectureIndex + 1
              }) a`
            )
            [lectureIndex].getAttribute("href");
        } else {
          lectureNotesPath = lectureNotesIndexDocument
            .querySelectorAll("#course_inner_section .maintabletemplate a")
            [lectureIndex].getAttribute("href");
        }
        if (!lectureNotesPath) return;
        lectureNotesURL = parseURL(lectureNotesPath);
      } catch (err) {}

      // get video URL
      const regex = /ocw_embed_chapter_media\(\'.*?\', \'.*?\',/gm;
      const matches = documentHTML.match(regex);
      if (matches && matches.length > 0) {
        const urls = findURLsInText(matches[0]);
        if (urls.length > 0) videoURL = urls[0];
      }
    }

    const lecture: Lecture = new Lecture({
      url,
      title,
      courseID,
      lectureIndex,
      aboutHTML,
      thumbnailURL,
      lectureNotesURL,
      videoURL,
    });

    response.json(lecture.toJSON());
  }
);
