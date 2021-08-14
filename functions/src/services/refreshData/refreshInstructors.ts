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
  for (const instructorName of Object.keys(instructorsCoursesMap)) {
    const instructorCourses: Course[] = instructorsCoursesMap[instructorName];
    const data = {
      name: instructorName,
      courseIDs: instructorCourses.map((course: Course) => course.id),
      departments: removeDuplicatesFromArray(instructorCourses.map((course: Course) => course.data.department).filter(notUndefinedFilter)),
      numberOfCourses: instructorCourses.length,
    };
    console.log(data);
    await saveToFirestore(INSTRUCTORS_COLLECTION_NAME, instructorName, data);
  }
};
export default refreshInstructors;
