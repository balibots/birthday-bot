import nunjucks from 'vite-plugin-nunjucks';

/*
   this is a bit fiddly but I can't see a better way of doing it right now:

      - when we're *developing*, we're forwarding the /web* traffic from the express server to Vite.
      We do this so we can run everything from the same port (web and api) and avoid CORS issues etc.
      We need the bot host variable to be replaced on the HTML by the  "local" one (I'm exposing it on a public IP address through an ssh tunnel - but maybe using localhost would work too). It has to be Vite doing this nunjucks transform as the express server is not touching any of that.

      - when we're *building*, we want the express server to render the HTML and to the nunjucks replace there. So we're keeping the nunjucks tag there as it is, given the resulting HTML file will then be rendered by express/nunjucks.

*/
const BOT_HOST = process.env.IS_DEV ? 'http://127.0.0.1:3000' : '{{ botHost }}';

export default {
  plugins: [
    nunjucks({
      variables: { 'index.html': { botHost: BOT_HOST } },
    }),
  ],
};
