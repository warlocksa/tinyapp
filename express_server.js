const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, getUrlsOfUser, getlongURLFromShortURL,generateRandomString } = require('./helpers.js');
const { send } = require("express/lib/response");



app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['my secret key', 'yet another secret key']
}));

app.set("view engine", "ejs");

//edit the key-value for checking the function get urls
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: 'userRandomID',
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: 'user2RandomID',
    
  }, 
  asdsa: {
    longURL: "https",
    userID: "userRandomID"
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
    password: "pwd2"
  }
};

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  }
});

//homepage and redirect to login without login
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.redirect("/login");
  } else {
    const urlDatabase2 = getUrlsOfUser(userID,urlDatabase);
    const templateVars = { urls: urlDatabase2, user: users[userID] };
    res.render("urls_index", templateVars);
  };
});

//create the new url
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.redirect("/login");
  } else {
  res.render("urls_new", { user: users[userID] });
}});

//equal to the GET /urls/:id, redirect to the edit page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.send("please login");
  } else {
    let url = getlongURLFromShortURL(userID, urlDatabase, shortURL);
      if (url !== shortURL) {
      return res.send('please write the right shortURL')
    } else {
    const templateVars = { shortURL, user: users[userID] };
    return res.render("urls_show", templateVars);
    }
  }
});

//eaqual to the GET /u/:id page. link to the website of longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("please write the right shoreURL");
  }
  const website = urlDatabase[shortURL].longURL;
  res.redirect(website);
});

//create the new website link and redirect to the page of edit shortURL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.send("please login");
  } else {
    for (let url in urlDatabase) {
      if (longURL !== urlDatabase[url][longURL]) {
        const shortURL = generateRandomString();
        urlDatabase[shortURL] = {
          longURL: longURL,
          userID: userID
        }
      return res.redirect(`/urls/${shortURL}`);
      }
    }
  }
});

//edit page
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  const userID = req.session.user_id;
  if (users[userID] === undefined) {
    return res.send("please login");
  } else {
    urlDatabase[shortURL] = {
      longURL: newURL,
      userID: userID
    };
    res.redirect('/urls');
  }
});

//delete element
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID] !== undefined) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_login", { user: null });
  }
});

//register
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID] !== undefined) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_register", { user: null });
  }
});

//login post
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = getUserByEmail(email, users);
  if (!uesr){
    return res.send("Please use the right email"
  } 
  const hashedPassword = bcrypt.hashSync(password, 10);
  bcrypt.compare(user.password, hashedPassword)
    .then((result) => {
      if (result) {
        req.session.user_id = user.id;
        return res.redirect("/urls");
      } else {
        return res.status(403).send("please enter the right password");
      }
    })
});

//register post
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    return res.status(400).send('please enter the email and password');
  }
  for (let key in users) {
    if (users[key].email === email) {
      return res.status(400).send('this email already used');
    }
  }
  users[user_id] = { id: user_id, email, password: hashedPassword };
  req.session.user_id = user_id;
  res.redirect("/urls");
});

//logout
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