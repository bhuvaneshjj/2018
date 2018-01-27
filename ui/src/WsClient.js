import WebSocketAsPromised from 'websocket-as-promised';
import Channel from 'chnl';
import { PORT } from './common';
import { WEBSOCKET_RECONNECT_INTERVAL, WEBSOCKET_REQUEST_TIMEOUT } from './constants';

/**
 * Usage:
 * const wsClient = new WsClient({ onConnect, onClose });
 * await wsClient.connect();
 * const response = await wsClient.sendRequest({ your: 'request' });
 * await wsClient.close();
 */
class WsClient {
  constructor({
    port = PORT,
    reconnectInterval = WEBSOCKET_RECONNECT_INTERVAL,
    requestTimeout = WEBSOCKET_REQUEST_TIMEOUT,
    onConnect,
    onClose
  } = {}) {
    const hostname = (window && window.location && window.location.hostname) || 'localhost';
    if (hostname === 'localhost') {
      this.url = `ws://${hostname}:${port}/`;
    } else {
      this.url = `wss://${hostname}/`;
    }
    this.reconnectInterval = reconnectInterval;
    this.requestTimeout = requestTimeout;
    this.setCallbacks({ onConnect, onClose });
    this.channel = new Channel();
    this.channel.addListener(this.onRequestAvailable);
    this.channel.mute({ accumulate: true });
  }

  connectPrivate = async request => {
    const ws = new WebSocketAsPromised(this.url, {
      createWebSocket: () => new WebSocket(this.url, 'jcm2018'),
      packMessage: data => JSON.stringify(data),
      unpackMessage: message => JSON.parse(message),
      attachRequestId: (data, requestId) => ({ ...data, requestId }),
      extractRequestId: data => data && data.requestId,
      timeout: this.requestTimeout
    });

    try {
      await ws.open();
    } catch (err) {
      this.retryConnect(request);
      return;
    }

    ws.onClose.addListener(this.handleClose);
    this.ws = ws;
    this.channel.unmute();

    if (this.onConnectCallback) {
      this.onConnectCallback();
    }

    request.resolve('Connected.');
  };

  connect = () => {
    let request = {};
    const promise = new Promise((resolve, reject) => {
      request = { ...request, resolve, reject };
    });

    this.connectPrivate(request);
    return promise;
  };

  isConnected = () => {
    const { ws } = this;
    return ws ? ws.isOpened : false;
  };

  retryConnect = request => {
    console.log('WebSocket client connect retry.');
    this.ws = null;
    setTimeout(() => this.connectPrivate(request), this.reconnectInterval);
  };

  handleClose = () => {
    this.channel.mute({ accumulate: true });

    if (this.onCloseCallback) {
      this.onCloseCallback();
    }

    const request = { resolve: () => {}, reject: () => {} };
    this.retryConnect(request);
  };

  setCallbacks = ({ onConnect, onClose }) => {
    this.onConnectCallback = onConnect;
    this.onCloseCallback = onClose;
  };

  onRequestAvailable = async request => {
    const { ws } = this;
    if (ws) {
      try {
        const response = await ws.sendRequest(request.data);
        request.resolve(response);
      } catch (err) {
        request.reject(err);
      }
      return;
    }
    // WsClient se mezitím odpojil. Naplánuj znovu.
    this.channel.dispatch(request);
  };

  sendRequest = async data => {
    let request = { data };
    const promise = new Promise((resolve, reject) => {
      request = { ...request, resolve, reject };
    });

    this.channel.dispatch(request);
    return promise;
  };

  close = () => {
    const { ws } = this;
    if (ws) {
      this.ws = null;
      return ws.close();
    }
    return Promise.resolve('Již zavřeno.');
  };
}

export default WsClient;
