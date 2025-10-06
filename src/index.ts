import express, { Express } from 'express';
import { setupApi } from './api';
import { loadUsers } from './db/fake-db';
import { setupSession } from './session';

async function initSystem() {
  await loadUsers();

  const app: Express = express();
  app.use(express.json());

  setupSession(app);
  setupApi(app);

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });

}

initSystem();