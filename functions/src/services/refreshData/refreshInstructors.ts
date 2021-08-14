import Course from '../../models/Course';
import {
  getInstructorsCoursesMap,
  notUndefinedFilter,
  removeDuplicatesFromArray,
  saveToFirestore,
} from '../../util';
import { INSTRUCTORS_COLLECTION_NAME } from '../../util/constants';

const refreshInstructors = async () => {
  const instructorsCoursesMap: { [key: string]: Course[] } = await getInstructorsCoursesMap();
  const instructorsNames = Object.keys(instructorsCoursesMap);
  for (const instructorName of instructorsNames) {
    const instructorCourses: Course[] = instructorsCoursesMap[instructorName];
    const data = {
      name: instructorName,
      courseIDs: instructorCourses.map((course: Course) => course.id),
      departments: removeDuplicatesFromArray(instructorCourses.map((course: Course) => course.data.department).filter(notUndefinedFilter)),
      numberOfCourses: instructorCourses.length,
    };
    await saveToFirestore(INSTRUCTORS_COLLECTION_NAME, instructorName, data);
  }
};
export default refreshInstructors;
