import { load, save } from './helper';

/**
  * Reset the state of the application back to the start.
  *
  * @param {} - no parameter
  * @returns {} - empty object
*/
export function clear() {
  const data = load();
  data.users.length = 0;
  data.quizzes.length = 0;
  data.sessions.length = 0;
  data.ids.userId = 0;
  data.ids.quizId = 0;
  data.ids.questionId = 0;
  save(data);

  return {};
}
