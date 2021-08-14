import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  Cache,
  getAllFromFirestore,
  removeDuplicatesFromArray,
} from '../../util';

const refreshLocations = functions.https.onRequest(async (request, response) => {
  let locationsAsJSONStrings: string[] = [];
  const courses = await getAllFromFirestore(Course.collectionName);
  courses.forEach((course) => {
    const courseObj = new Course(course.data(), course.id);
    const courseLocations = courseObj.data.locations;
    courseLocations.forEach((location: Course['data']['locations'][0]) => {
      locationsAsJSONStrings.push(JSON.stringify(location));
    });
  });
  const locationsAsObjs = removeDuplicatesFromArray(locationsAsJSONStrings).map((e: string) => JSON.parse(e));
  const locationsMap: { [key: string]: any } = {};
  locationsAsObjs.forEach((location: Course['data']['locations'][0]) => {
    if (location.topic) if (!locationsMap[location.topic]) locationsMap[location.topic] = {};
    if (location.category) if (!locationsMap[location.topic][location.category]) locationsMap[location.topic][location.category] = {};
    if (location.speciality)
      if (!locationsMap[location.topic][location.category][location.speciality])
        locationsMap[location.topic][location.category][location.speciality] = {};
    locationsMap[location.topic][location.category][location.speciality] = '';
  });
  Cache.saveToCache('locations', locationsMap);
});

export default refreshLocations;
