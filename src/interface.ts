export enum Colours {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
  purple = 'purple',
  brown = 'brown',
  orange = 'orange'
}

export enum GameState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum GameAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

export interface PlayerStatus {
  state: GameState,
  numQuestions: number,
  atQuestion: number
}

export interface Player {
  // Game session id this player belong to
  name: string,
  playerId: number,
  sessionId: number
}

export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  usedPasswords: string[],
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface Question {
  questionId: number
  question: string,
  duration: number,
  thumbnailUrl: string,
  points: number,
  answers: Answer[]
}

export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  quizOwnedby: number;
  duration: number;
  numQuestions: number;
  questions: Question[];
  thumbnailUrl: string;
  activeSessions: number[];
  inactiveSessions: number[]
}

export interface Session {
  userId: number;
  sessionId: string
}

export interface Ids {
  userId: number;
  quizId: number;
  questionId: number;
  answerId: number;
  gameSessionId: number;
  playerId: number;
}

export interface GameSession {
  gameSessionId: number,
  state: GameState;
  atQuestion: number;
  players: Player[];
  metadata: Quiz;
  autoStartNum: number
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  trash: Quiz[];
  sessions: Session[];
  gameSessions: GameSession[];
  ids: Ids;
  players: Player[];
}

export interface ReturnQuizList {
name: string;
quizId: number
}

export interface ReturnUserDetails {
  userId: number,
  name: string,
  email: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
}

export interface ReturnQuizInfo {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
  thumbnailUrl: string
}

export interface ReturnGameSession {
state: GameState,
atQuestion: number;
players: string[];
metadata: ReturnQuizInfo;
}

export interface ReturnAnswer {
  answerId: number;
  answer: string;
  colour: string;
}

export interface ReturnQuestion {
  questionId: number
  question: string,
  duration: number,
  thumbnailUrl: string,
  points: number,
  answers: ReturnAnswer[]
}
