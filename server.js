const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'xssdemo_secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Disable Content-Security-Policy (CSP) header for XSS testing
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy'); // Ensure no CSP blocks inline scripts
  next();
});

// Store user input (XSS vulnerability)
let submissions = [];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    req.session.user = username;
    res.redirect('/register.html');
  } else {
    res.send('Invalid Login. Please <a href="/index.html">try again</a>.');
  }
});

app.post('/register', (req, res) => {
  if (req.session.user) {
    console.log('Received comment:', req.body.comment); // Log the comment for debugging
    submissions.push(req.body.comment); // Store user input directly (XSS vulnerability)
    res.redirect('/register.html');
  } else {
    res.redirect('/index.html');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/index.html');
});

app.get('/data', (req, res) => {
  if (req.session.user) {
    res.send(submissions.join('<br>')); // Reflect stored submissions directly (XSS vulnerability)
  } else {
    res.redirect('/index.html');
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
