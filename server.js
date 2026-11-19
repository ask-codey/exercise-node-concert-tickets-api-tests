// Starts Starlight Stage's tickets API at http://localhost:3100, using the app in app.js.
// Run it with: npm start (or npm run dev, which restarts it each time you save). Stop it with Ctrl+C.
// Ready to use: you don't need to change this file.
import { app } from "./app.js";

const port = 3100;

app.listen(port, () => {
  console.log(`Starlight Stage's tickets API is listening on http://localhost:${port}`);
});
