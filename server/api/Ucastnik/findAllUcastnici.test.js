'use strict';

const db = require('../../db');
const Actions = require('../../../common');
const createWsServer = require('../../ws_server');
const createWsClient = require('../ws_client');

const port = 5602;
const wsServer = createWsServer({});
const wsClient = createWsClient({ port });

beforeAll(async () => {
  wsServer.httpServer().listen(port);
  await wsClient.open();

  await db.dropDatabase();
});

afterAll(async () => {
  await wsClient.close();
  wsServer.httpServer().close();

  await db.disconnect();
});

it('findAllUcastnici', async () => {
  // :TODO: create some first
  await wsClient.sendRequest(Actions.findAllUcastnici());
});