require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const session = require('express-session');
const authInterceptor = require('./auth-middleware');
const imageController = require('./imageController');
const authController = require('./authController');
const bodyParser = require('body-parser');
const csrf = require('csrf');
const cors = require('cors');
const tokens = new csrf();
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_CONNECTION, {
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

const port = process.env.PORT || 80;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

app.use(cors({
  origin: 'https://gray-glacier-0732b8903.5.azurestaticapps.net'
}));

app.post('/api/login', async (req, res) => {
  console.log(req.body);
  user = await verifyIdToken(req.body.credential);
  res.redirect(`https://gray-glacier-0732b8903.5.azurestaticapps.net/?token=${req.body.credential}&user=${user.sub}`)
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(authInterceptor);


app.get('/api/test/auth', async (req, res) => {
  console.log(req.body);
  console.log('test auth')
  res.status(200).send("TEST AUTH GOOD")
})


app.use('/api/images', imageController);
app.use('/auth', authController);



app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});