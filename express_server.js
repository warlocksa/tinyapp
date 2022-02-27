const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers.js');

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
}

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['my secret key', 'yet another secret key']
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "pwd"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    const templateVars = { urls: urlDatabase, user: undefined };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { urls: urlDatabase, user: users[userID] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  res.render("urls_new", { user: users[userID] });
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.redirect("/login");
  } else {
    const templateVars = { shortURL, user: users[userID] };
    return res.render("urls_show", templateVars);
  }
})

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("id is not login");
  }
  const longURL = urlDatabase[shortURL][longURL];
  res.render(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  for (let url in urlDatabase) {
    if (longURL !== urlDatabase[url][longURL]) {
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = {
        longURL: longURL
      }
      return res.redirect("/urls");
    }
  }
  res.send("Ok");
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newURL
  };
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  return res.render("urls_login", { user: null });
});

app.get("/register", (req, res) => {
  return res.render("urls_register", { user: null });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  bcrypt.compare(user.password, hashedPassword)
    .then((result) => {
      if (result) {
        req.session.user_id = user.id;
        return res.redirect('/urls');
      } else {
        return res.status(403).send('please enter the right password');
      }
    })
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    return res.status(400).send('please enter the email and password');
  }
  for (let key in users) {
    if (users[key] = { email: email }) {
      return res.status(400).send('this email already used');
    }
  }
  users[user_id] = { id: user_id, email, password: hashedPassword };
  req.session.user_id = user_id;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});