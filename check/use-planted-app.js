// Used only by npm run check: while your tests run, every import of app.js gets the planted-bug copy named in the
// PLANTED_APP environment variable instead. Your tests and the other files stay as they are.
// You don't need to change this file.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const realApp = new URL("../app.js", import.meta.url).href;
const planted = process.env.PLANTED_APP;

if (planted) {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      const result = nextResolve(specifier, context);
      if (result.url === realApp) {
        return { ...result, url: pathToFileURL(planted).href };
      }
      return result;
    },
  });
}
