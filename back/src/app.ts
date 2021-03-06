import cors from 'cors';
import SocketIOClient, { Socket } from 'socket.io';

import { createApp } from './express.server';
import { envConstants, connectToDB } from 'core';
import { api } from './api';
import { processInputMessage, InputMessageTypes, processOutputMessageCollection, Action, SocketInfo } from './messages';

const app = createApp();

let http = require('http').Server(app);
// set up socket.io and bind it to our
// http server.
let io: SocketIOClient.Socket = require('socket.io')(http);

//options for cors midddleware
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  // IMPORTANT LIMIT HERE YOUR CLIENT APPS DOMAINS
  origin: '*',
  preflightContinue: false,
};

app.use(cors(options));
app.use(envConstants.API_URL, api);

app.listen(envConstants.PORT, async () => {
  if(!envConstants.isMockRepository && envConstants.MONGODB_URI) {
    await connectToDB(envConstants.MONGODB_URI);
  }
  console.log(`Using ${envConstants.isMockRepository ? 'Mock' : 'DataBase'} for session storage`)
  console.log(`Server ready at http://localhost:${envConstants.PORT}${envConstants.API_URL}`);
});

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', async function (socket: Socket) {
  // WATCH OUT !! Reconnect is not implemented
  // In the connection input processing, we should
  // check if connectionId matches with userId and RoomId
  // if not reject, if it's accepted send connection
  // reestablished
  const { room, trainertoken } = socket.handshake.query;
  console.log(`room request: ${room}`);
  console.log(`trainer token: ${trainertoken}`);
  console.log('*** Session ID:', socket.conn.id);

  let outputMessageCollection: Action[] = [];
  const socketInfo: SocketInfo = {
    socket: socket,
    io,
    connectionId: socket.conn.id,
  };

  // TODO encapuslate this to processInputMessage
  if (trainertoken) {
    outputMessageCollection = await processInputMessage(socketInfo, {
      type: InputMessageTypes.ESTABLISH_CONNECTION_TRAINER,
      payload: {
        room,
        trainertoken,
      },
    });
  } else {
    outputMessageCollection = await processInputMessage(socketInfo, {
      type: InputMessageTypes.ESTABLISH_CONNECTION_STUDENT,
      payload: {
        room,
      },
    });
  }

  processOutputMessageCollection(socketInfo, outputMessageCollection);

  socket.on('message', async function (message: any) {
    console.log(message);
    if (message && message.type) {
      const outputMessageCollection: Action[] = await processInputMessage(
        socketInfo,
        message
      );

      await processOutputMessageCollection(socketInfo, outputMessageCollection);
    }
  });
});

const server = http.listen(3001, function () {
  console.log('listening on *:3001');
});
