import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();
app.listen(config.port, () => {
  console.log(
    `\uD83D\uDC7D UNREMARKABLE HUMAN WEBSITE live at http://localhost:${config.port}`,
  );
});
