import Course from "../../models/Course";
import { Cache, getAllFromFirestore } from "../../util";

const refreshSemestersList = async () => {
  const semesters: Set<string> = new Set();
  const courses = await getAllFromFirestore(Course.collectionName);
  courses.forEach((course) => {
    const courseObj = new Course(course.data(), course.id);
    semesters.add(courseObj.data.semesterTaught);
  });
  const semestersArray = Array.from(semesters);
  semestersArray.sort((a: string, b: string) => {
    const semesterTime = (x: string) => {
      let [season, year] = x.split(" ");
      const yearNum = parseInt(year);
      const seasons = ["Fall", "Spring", "Summer", "Winter"];
      return yearNum * 10 + seasons.indexOf(season);
    };
    return semesterTime(b) - semesterTime(a);
  });
  await Cache.saveToCache("semesters-list", semestersArray);
};
export default refreshSemestersList;
