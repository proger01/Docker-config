const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
const cors = require('cors');
let RedisStore = require('connect-redis')(session);
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require('./config/config');
let redisClient = redis.createClient({ host: REDIS_URL, port: REDIS_PORT });

const app = express();

const port = process.env.PORT || 3000;

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log('successfully connected to DB'))
    .catch((e) => {
      console.log('e', e)
      setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();

app.enable('trust proxy');
app.use(cors({}));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: SESSION_SECRET,
  cookies: {
    secure: false,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    maxAge: 60000,
  },
}));
app.use(express.json());

app.get('/api/v1', (req, res) => {
  res.send('<h2>Hi There!!</h2>');
  console.log('yeah it ran');
});

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});