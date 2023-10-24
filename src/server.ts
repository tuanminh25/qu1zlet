import express, { json, Request, Response } from 'express';
import { echo } from './echo/newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { adminAuthLogin, adminAuthRegister, adminAuthLogout } from './auth';
import { adminUserDetails, updatePassword, userUpdateDetails } from './user';
import { clear } from './other';
import { adminQuizCreate, adminQuizRemove } from './quiz';
import { adminQuestionCreate } from './question';


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
  const ret = echo(data);
  if ('error' in ret) {
    res.status(400);
  }
  return res.json(ret);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();

  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token;
  const response = adminUserDetails(String(token));

  if ('error' in response) {
    return res.status(401).json(response);
  }
  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token;

  const response = adminAuthLogout(String(token));

  if ('error' in response) {
    return res.status(401).json(response);
  }
  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = updatePassword(token, oldPassword, newPassword);

  if (response.error === 'Invalid token') {
    return res.status(401).json(response);
  }

  if ('error' in response) {
    return res.status(400).json(response);
  }

  res.json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const token = req.body.token;
  const name = req.body.name;
  const description = req.body.description;

  const response = adminQuizCreate(String(token), String(name), String(description));

  if ('error' in response && (JSON.stringify(response) !== JSON.stringify({ error: 'Invalid Token' }))) {
    return res.status(400).json(response);
  } else if (JSON.stringify(response) === JSON.stringify({ error: 'Invalid Token' })) {
    return res.status(401).json(response);
  }
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token;
  const { quizId } = req.params;

  const response = adminQuizRemove(String(token), parseInt(quizId));
  console.log(response);

  if (response.error === 'Invalid Token') {
    return res.status(401).json(response);
  } else if ('error' in response) {
    return res.status(403).json(response);
  }

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const { token, questionText, questionBody } = req.body;
  const { quizId } = req.params; 
  const response = adminQuestionCreate(token, parseInt(quizId), questionBody );

  if ('error' in response && response.error !== 'Invalid token' && response.error !== 'Unauthorised') {
    return res.status(400).json(response);
  } else if (response.error === 'Invalid token') {
    return res.status(401).json(response);
  } else if (response.error === 'Unauthorised') {
    return res.status(403).json(response);
  }
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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
