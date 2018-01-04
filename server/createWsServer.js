'use strict';

const http = require('http');
const logger = require('heroku-logger');
const WebSocketServer = require('websocket').server;
const processMessage = require('./api/api');

const createWsServer = ({ httpServer, originAllowed }) => {
  const wsHttpServer = httpServer || http.createServer(); // for testing

  const ws = new WebSocketServer({
    httpServer: wsHttpServer,
    autoAcceptConnections: false
  });

  ws.httpServer = () => wsHttpServer;

  ws.on('request', request => {
    if (originAllowed && !originAllowed(request.origin)) {
      request.reject(401);
      logger.warn(`Connection for origin '${request.origin}' rejected.`);
      return;
    }

    try {
      const connection = request.accept('jcm2018', request.origin);
      logger.info(`Connection for origin '${request.origin}' accepted.`);

      connection.on('message', async message => {
        if (message.type !== 'utf8') {
          connection.drop(connection.CLOSE_REASON_INVALID_DATA);
          logger.warn(`Message with unknown type ${message.type}.`);
          return;
        }

        await processMessage(connection, message);
      });

      connection.on('close', (reasonCode, description) => {
        logger.info(
          `Connection ${connection.remoteAddress} disconnected with ${reasonCode}: ${description}.`
        );
      });
    } catch (err) {
      logger.debug(`Connection rejected: ${err}`);
    }
  });

  return ws;
};

module.exports = createWsServer;
