"use strict";

const fs = require("async-file");
const logger = require("heroku-logger");
const http = require("http");
const path = require("path");
const url = require("url");

const STATIC_ASSETS_PATH = "../ui/build";
const INITIAL_FILE = "index.html";

const pickContentType = extension => {
  const contentTypes = {
    ".css": "text/css",
    ".eot": "application/vnd.ms-fontobject",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".js": "text/javascript",
    ".json": "application/json",
    ".map": "application/json",
    ".svg": "image/svg+xml",
    ".ttf": "application/font-ttf",
    ".woff": "application/font-woff",
    ".woff2": "application/font-woff2"
  };

  return contentTypes[extension];
};

const responseAbend = (response, message) => {
  response.set("Content-Type", "text/plain");
  response.statusCode = 500;
  response.send(`Internal error: ${message}`);
  response.end();
};

const streamFile = async (filename, response) => {
  const file = path.resolve(__dirname, STATIC_ASSETS_PATH, filename);

  let fd;
  try {
    fd = await fs.open(file, "r");
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    }

    logger.error(`Problem while opening ${file}: ${err.message}`);
    throw err;
  }

  let stats;
  try {
    stats = await fs.fstat(fd);
  } catch (err) {
    logger.error(`Problem while gettting stats for ${file}: ${err.message}`);
    throw err;
  }

  const ext = path.extname(file);
  const contentType = pickContentType(ext);
  if (contentType === undefined) {
    const message = `Unrecognized extension ${ext} for ${file}`;
    logger.fatal(message);
    throw new Error(message);
  }

  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": stats.size
  });

  let rs = fs.createReadStream(undefined, { fd: fd });
  rs.on("error", err => {
    rs.end();
    const message = `Problem while reading ${file}: ${err.message}`;
    logger.error(message);
    responseAbend(response, message);
  });

  logger.info(
    `Streaming file ${file} of size ${stats.size} with content type ${contentType}.`
  );
  rs.pipe(response);

  return true;
};

const streamRequest = async (pathname, response) => {
  let handled = await streamFile(pathname, response);
  if (!handled) {
    // Handle all the remaining requests so the React app can handle routing.
    handled = await streamFile(INITIAL_FILE, response);
    if (!handled) {
      const message = `Failed to serve ${INITIAL_FILE}.`;
      logger.fatal(message);
      throw new Error(message);
    }
  }
};

let server = http.createServer((request, response) => {
  logger.info(`HTTP request for ${request.url}.`);

  response.on("error", err => {
    const message = `Problem while writing HTTP response: ${err.message}`;
    logger.error(message);
    responseAbend(response, message);
  });

  if (request.url.startsWith("/api")) {
    response.set("Content-Type", "application/json");
    response.send('{ "message" : "Hello from the API server!" }');
    response.end();
  } else {
    let pathname = url.parse(request.url).pathname;
    if (pathname[0] === "/") {
      pathname = pathname.substring(1);
    }
    if (pathname === "") {
      pathname = INITIAL_FILE;
    }

    try {
      streamRequest(pathname, response).then();
    } catch (err) {
      responseAbend(response, err.message);
    }
  }
});

module.exports = server; // for testing
