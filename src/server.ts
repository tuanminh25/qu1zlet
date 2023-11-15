import express, { json, Request, Response } from 'express';
import { echo } from './echo/newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { adminAuthLogin, adminAuthRegister, adminAuthLogout } from './auth';
import { adminUserDetails, updatePassword, adminUserUpdate } from './user';
import { clear } from './other';
import { adminQuizCreate, adminQuizList, adminQuizRemove, adminQuizInfo, adminQuizDescriptionUpdate, adminQuizNameUpdate, adminThumbnailUpdate, adminQuizTransfer } from './quiz';
import { adminQuestionCreate, listOfQuestions, moveQuizQuestion, dupQuizQuestion, currentPlayerQuestionInfor, adminQuestionUpdate, adminQuestionDelete } from './question';
import { viewQuizzesInTrash, emptyTrash, restoreQuizInTrash } from './trash';
import { gameSessionStart, getGameStatus, updateGameSessionState, joinPlayer, playerStatus } from './game';
import { adminQuizInfoIt2, adminQuizNameUpdateIt2, adminQuizTransferIt2 } from './old_it2_functions/quizIt2';
import { adminQuestionCreateIt2, dupQuizQuestionIt2, adminQuestionUpdateIt2, adminQuestionDeleteIt2 } from './old_it2_functions/questionIt2';
import {
  getChatMessages,
  sendChatMessages
} from './player';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  res.json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();

  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);

  res.json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token;
  const response = adminUserDetails(String(token));

  res.json(response);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token;
  const response = adminAuthLogout(String(token));

  res.json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { oldPassword, newPassword } = req.body;
  const response = updatePassword(String(token), oldPassword, newPassword);

  res.json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token;
  const name = req.body.name;
  const description = req.body.description;

  const response = adminQuizCreate(String(token), String(name), String(description));
  res.json(response);
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token;
  const response = viewQuizzesInTrash(String(token));

  res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { email, nameFirst, nameLast } = req.body;
  const response = adminUserUpdate(String(token), email, nameFirst, nameLast);

  res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token;
  const response = adminQuizList(String(token));
  res.json(response);
});

app.get('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { quizId } = req.params;
  const response = adminQuizInfo(String(token), parseInt(quizId));

  res.json(response);
});

app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { description } = req.body;
  const { quizId } = req.params;

  const response = adminQuizDescriptionUpdate(String(token), parseInt(quizId), String(description));

  res.json(response);
});

app.delete('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { quizId } = req.params;

  const response = adminQuizRemove(String(token), parseInt(quizId));
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = req.params.quizid;
  const token = req.headers.token;
  const autoStartNum = req.body.autoStartNum;
  const response = gameSessionStart(String(token), parseInt(quizId), parseInt(autoStartNum));

  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = req.params.quizid;
  const sessionId = req.params.sessionid;
  const token = req.headers.token;
  const action = req.body.action;
  const response = updateGameSessionState(String(token), parseInt(quizId), parseInt(sessionId), String(action));

  res.json(response);
});

app.post('/v2/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const { token } = req.headers;
  const { questionBody } = req.body;
  const { quizId } = req.params;
  const response = adminQuestionCreate(String(token), parseInt(quizId), questionBody);

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = req.params.quizid;
  const sessionId = req.params.sessionid;
  const token = req.headers.token;
  const response = getGameStatus(String(token), parseInt(quizId), parseInt(sessionId));

  res.json(response);
});

app.put('/v1/admin/quiz/:quizId/thumbnail', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { imgUrl } = req.body;
  const { quizId } = req.params;

  const response = adminThumbnailUpdate(String(token), parseInt(quizId), String(imgUrl));

  res.json(response);
});

app.get('/v1/player/:playerId/question/:questionposition', (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const questionposition = req.params.questionposition;
  const response = currentPlayerQuestionInfor(parseInt(playerId), parseInt(questionposition));
  res.json(response);
});

app.get('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const response = getChatMessages(parseInt(playerId));
  res.json(response);
});

app.get('/v1/player/:playerId', (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const response = playerStatus(parseInt(playerId));
  res.json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const sessionId = req.body.sessionId;
  const name = req.body.name;
  const response = joinPlayer(sessionId, name);
  res.json(response);
});

app.post('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const message = req.body.message;
  const response = sendChatMessages(parseInt(playerId), String(message.messageBody));
  res.json(response);
});
// ====================================================================
// it2 routes below
// ====================================================================

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token;
  const response = adminAuthLogout(String(token));

  res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token;
  const response = adminUserDetails(String(token));

  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = updatePassword(token, oldPassword, newPassword);

  res.json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const token = req.body.token;
  const name = req.body.name;
  const description = req.body.description;

  const response = adminQuizCreate(String(token), String(name), String(description));

  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminUserUpdate(token, email, nameFirst, nameLast);

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = req.params.quizid;
  const sessionId = req.params.sessionid;
  const token = req.headers.token;
  const response = getGameStatus(String(token), parseInt(quizId), parseInt(sessionId));

  res.json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token;
  let quizIds = req.query.quizIds;
  quizIds = String(quizIds);
  const numberArray = quizIds.split(',').map(function(item) {
    return parseInt(item.trim(), 10);
  });
  const response = emptyTrash(String(token), numberArray);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const { name } = req.body;
  const { token } = req.headers;
  const { quizId } = req.params;
  const response = adminQuizNameUpdate(String(token), parseInt(quizId), String(name));
  res.json(response);
});

app.post('/v2/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const { token } = req.headers;
  const { quizId } = req.params;

  const response = restoreQuizInTrash(String(token), parseInt(quizId));
  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const { token } = req.headers;
  const quizId = parseInt(req.params.quizId.toString());
  const questionId = parseInt(req.params.questionId.toString());
  const { questionBody } = req.body;

  const response = adminQuestionUpdate(String(token), quizId, questionId, questionBody);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const { token } = req.headers;
  const quizId = req.params.quizId;
  const questionId = req.params.questionId;

  const response = dupQuizQuestion(String(token), parseInt(quizId), parseInt(questionId));

  res.json(response);
});

app.delete('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.headers.token;
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);

  const response = adminQuestionDelete(String(token), quizId, questionId);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const { token } = req.headers;
  const { userEmail } = req.body;
  const { quizId } = req.params;

  const response = adminQuizTransfer(String(token), parseInt(quizId), String(userEmail));

  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizId/question/:questionId/move', (req: Request, res: Response) => {
  const { token } = req.headers;
  const { newPosition } = req.body;
  const { quizId, questionId } = req.params;

  const response = moveQuizQuestion(String(token), parseInt(quizId), parseInt(questionId), parseInt(newPosition));
  res.json(response);
});

// ====================================================================
// it2 routes below
// ====================================================================

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token;
  const response = adminAuthLogout(String(token));

  res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token;
  const response = adminUserDetails(String(token));

  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = updatePassword(token, oldPassword, newPassword);

  res.json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const token = req.body.token;
  const name = req.body.name;
  const description = req.body.description;

  const response = adminQuizCreate(String(token), String(name), String(description));

  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminUserUpdate(token, email, nameFirst, nameLast);

  res.json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token;
  const response = viewQuizzesInTrash(String(token));

  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token;
  const response = adminQuizList(String(token));
  res.json(response);
});

app.get('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token;
  const { quizId } = req.params;
  const response = adminQuizInfoIt2(String(token), parseInt(quizId));

  res.json(response);
});

app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const { quizId } = req.params;
  const response = adminQuizDescriptionUpdate(String(token), parseInt(quizId), String(description));

  res.json(response);
});

app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token;
  const { quizId } = req.params;
  const response = adminQuizRemove(String(token), parseInt(quizId));

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const { token } = req.body;
  const { quizId } = req.params;

  const response = restoreQuizInTrash(String(token), parseInt(quizId));
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const { quizId } = req.params;
  const response = adminQuestionCreateIt2(token, parseInt(quizId), questionBody);

  if (response.error === 'Invalid token') {
    return res.status(401).json(response);
  } else if (response.error === 'Unauthorised') {
    return res.status(403).json(response);
  } else if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.query.token;
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);

  const response = adminQuestionDeleteIt2(String(token), quizId, questionId);

  if (response.error === 'Invalid token') {
    return res.status(401).json(response);
  } else if (response.error === 'Unauthorised') {
    return res.status(403).json(response);
  } else if (response.error) {
    return res.status(400).json(response);
  } else {
    res.json(response);
  }
});

app.put('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const questionBody = req.body.questionBody;

  const response = adminQuestionUpdateIt2(String(token), quizId, questionId, questionBody);

  if (response.error === 'Invalid token') {
    return res.status(401).json(response);
  } else if (response.error === 'Unauthorised') {
    return res.status(403).json(response);
  } else if (response.error) {
    return res.status(400).json(response);
  } else {
    res.json(response);
  }
});

app.put('/v1/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const { quizId } = req.params;

  const response = adminQuizNameUpdateIt2(String(token), parseInt(quizId), String(name));

  if ('error' in response) {
    if (response.error === 'Invalid Quiz Name') {
      return res.status(400).json(response);
    }
    if (response.error === 'Quiz name already exists') {
      return res.status(400).json(response);
    }
    if (response.error === 'Invalid Token') {
      return res.status(401).json(response);
    } else if (response.error === 'Unauthorised') {
      return res.status(403).json(response);
    }
  }

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const { quizId } = req.params;

  const response = adminQuizTransferIt2(String(token), parseInt(quizId), String(userEmail));

  if ('error' in response) {
    if (response.error === 'Email not found') {
      return res.status(400).json(response);
    }
    if (response.error === 'userEmail cannot already be the owner of the quiz') {
      return res.status(400).json(response);
    }
    if (response.error === 'Quiz name already exists for target user') {
      return res.status(400).json(response);
    }
    if (response.error === 'Invalid Token') {
      return res.status(401).json(response);
    } else if (response.error === 'Unauthorised') {
      return res.status(403).json(response);
    }
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/listOfQuestions/:quizId', (req: Request, res: Response) => {
  const token = req.query.token;
  const { quizId } = req.params;
  const response = listOfQuestions(String(token), parseInt(quizId));
  res.json(response);
});

app.put('/v1/admin/quiz/:quizId/question/:questionId/move', (req: Request, res: Response) => {
  const { token, newPosition } = req.body;
  const { quizId, questionId } = req.params;

  const response = moveQuizQuestion(String(token), parseInt(quizId), parseInt(questionId), parseInt(newPosition));
  res.json(response);
});

app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = req.params.quizId;
  const questionId = req.params.questionId;

  const response = dupQuizQuestionIt2(String(token), parseInt(quizId), parseInt(questionId));

  if (response.error === 'Token is empty or invalid') {
    return res.status(401).json(response);
  } else if (response.error === 'Valid token is provided, quiz does not exist: ' + parseInt(quizId)) {
    return res.status(403).json(response);
  } else if (response.error === 'Valid token is provided, but user is not an owner of this quiz') {
    return res.status(403).json(response);
  } else if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token;
  let quizIds = req.query.quizIds;
  quizIds = String(quizIds);
  const numberArray = quizIds.split(',').map(function(item) {
    return parseInt(item.trim(), 10);
  });
  const response = emptyTrash(String(token), numberArray);
  res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
