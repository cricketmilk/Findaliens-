import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import { incrementCounter } from './store.js';
import { layout } from './layout.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,
      },
    }),
  );

  app.use(express.static(config.publicDir));

  // Retro hit counter — count HTML page views (not static assets).
  app.use((req, res, next) => {
    if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
      incrementCounter();
    }
    next();
  });

  app.use('/', publicRouter);
  app.use('/', adminRouter);

  app.use((req, res) => {
    res.status(404).send(
      layout({
        title: '404',
        body: '<div class="panel center"><h2>404 — PAGE NOT FOUND</h2><p class="comic">You have wandered into the void. The aliens took this page. Or you mistyped. Probably mistyped.</p><a class="btn" href="/">GO HOME</a></div>',
        req,
      }),
    );
  });

  return app;
}
