import { getData, setData } from "./dataStore.js";

let store  = getData();

/**
  * Reset the state of the application back to the start.
  * 
  * @param {} - no parameter
  * @returns {} - empty object
*/
export function clear() {
  store.users.length = 0;
  store.quizzes.length = 0;
  setData(store);
  return {
    
  }
}