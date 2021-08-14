import * as functions from 'firebase-functions';

import refreshCourses from './refreshCourses';
import refreshInstructorsMap from './refreshInstructors';
import refreshLocations from './refreshLocations';
import refreshSemestersList from './refreshSemestersList';

const refreshJobsMap: { [jobName: string]: Function } = {
  'Refresh Courses': refreshCourses,
  'Refresh Instructors': refreshInstructorsMap,
  'Refresh Semesters List': refreshSemestersList,
  'Refresh Locations': refreshLocations,
};

const runRefreshJobs = async () => {
  const jobNames = Object.keys(refreshJobsMap);
  for (const jobName of jobNames) {
    functions.logger.log(`Starting ${jobName} job.`);
    await refreshJobsMap[jobName]();
    functions.logger.log(`Finished ${jobName} job.`);
  }
};

export const refreshDataJob = functions.pubsub
  .schedule('0 8 * * *') // every day at 8am
  .timeZone('America/New_York')
  .onRun(async () => {
    await runRefreshJobs();
    return null;
  });

export const refreshData = functions.https.onRequest(async (request, response) => {
  response.json({
    message: 'Command to refresh data received succesfully.',
  });
  await runRefreshJobs();
});
