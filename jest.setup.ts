import { disconnectClient } from './src/redis';
import { server } from './src/mocks/server';

// Establish API mocking before all tests.
beforeAll(() =>
  server.listen({
    onUnhandledRequest(req, print) {
      // not warning about requests to dynamodb - we want those to go through
      if (req.url.host.match(/^dynamodb\.(.*)\.amazonaws\.com/)) {
        return;
      }

      print.warning();
    },
  })
);

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => {
  disconnectClient();
  server.close();
});
