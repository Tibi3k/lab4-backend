const { OAuth2Client } = require('google-auth-library');
require('dotenv').config(); 
const csrf = require('csrf');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const tokens = new csrf();

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

async function verifyToken (credentials){
  try {
    const user = await verifyIdToken(credentials);

    // Check CSRF token
    //const isValidCsrfToken = tokens.verify(req.session.csrfSecret, csrfToken);
    //if (!isValidCsrfToken) {
    //  throw new Error('Invalid CSRF token');
    //}
    return user;
    next();
  } catch (error) {
    console.log("Error while authenticating")
    console.log(error)
    return undefined
  }

}

async function authInterceptor(req, res, next) {
  console.log('authenticating')
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Credentials or CSRF token missing' });
  }
  const token = authHeader.split(' ')[1];
  try {
    console.log(token)
    user = await verifyToken(token)
    console.log(user)
    if(user === undefined)
      return res.status(401).json("Unauthorized");
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = authInterceptor;