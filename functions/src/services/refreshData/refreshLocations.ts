import Course from '../../models/Course';
import {
  Cache,
  GenericObject,
  getAllFromFirestore,
  removeDuplicatesFromArray,
} from '../../util';
import { LOCATIONS_HAS_OWN_ITEMS_KEY } from '../../util/constants';

const refreshLocations = async () => {
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
  const locationsMap: GenericObject = {};
  locationsAsObjs.forEach((location: Course['data']['locations'][0]) => {
    // if (location.speciality) console.log(location.speciality);
    if (location.topic && !locationsMap[location.topic]) locationsMap[location.topic] = {};
    if (location.category && !locationsMap[location.topic][location.category]) locationsMap[location.topic][location.category] = {};
    if (location.speciality && !locationsMap[location.topic][location.category][location.speciality])
      locationsMap[location.topic][location.category][location.speciality] = {};

    if (!location.topic) {
      locationsMap[LOCATIONS_HAS_OWN_ITEMS_KEY] = true;
    } else if (!location.category) {
      locationsMap[location.topic][LOCATIONS_HAS_OWN_ITEMS_KEY] = true;
    } else if (!location.speciality) {
      locationsMap[location.topic][location.category][LOCATIONS_HAS_OWN_ITEMS_KEY] = true;
    } else {
      locationsMap[location.topic][location.category][location.speciality][LOCATIONS_HAS_OWN_ITEMS_KEY] = true;
    }
  });

  const convertLocationsHasOwnItemsKeyToBooleanVal = (obj: GenericObject) => {
    Object.keys(obj).forEach((k) => {
      if (obj[k][LOCATIONS_HAS_OWN_ITEMS_KEY] === true && Object.keys(obj[k]).length === 1) {
        obj[k] = true;
      } else {
        convertLocationsHasOwnItemsKeyToBooleanVal(obj[k]);
      }
    });
  };
  convertLocationsHasOwnItemsKeyToBooleanVal(locationsMap);

  await Cache.saveToCache('locations', locationsMap);
};

export default refreshLocations;
