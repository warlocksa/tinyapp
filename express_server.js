const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, getUrlsOfUser, checkShortURL, generateRandomString } = require("./helpers.js");
const { send } = require("express/lib/response");



app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: "session",
  keys: ["my secret key", "yet another secret key"]
}));

app.set("view engine", "ejs");

//edit the key-value for checking the function get urls
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
    
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
  if (!users[userID]) {
    return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  }
});

//homepage and redirect to login without login
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!users[userID]) {
    return res.send("please login");
  } else {
    // create a new object for each user
    const urlDatabase2 = getUrlsOfUser(userID,urlDatabase);
    const templateVars = { urls: urlDatabase2, user: users[userID] };
    res.render("urls_index", templateVars);
  };
});

//create the new url
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!users[userID]) {
    return res.redirect("/login");
  } else {
  res.render("urls_new", { user: users[userID] });
}});

//equal to the GET /urls/:id, redirect to the edit page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  let url = checkShortURL(userID, urlDatabase, shortURL);
  if (!users[userID]) {
    return res.send("please login");
  } else {
    if (url !== shortURL) {
    return res.send("please write the right shortURL")
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
  if (!users[userID]) {
    return res.send("please login");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID
    }
  res.redirect(`/urls/${shortURL}`);
  }
});

//aqual to the GET /urls/:id page, function is edit
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  const userID = req.session.user_id;
  const url = checkShortURL(userID, urlDatabase, shortURL);
  if (!users[userID]) {
    res.send("please login");
  }
  // make sure every users can access their own shortURL
  if (url !== shortURL) {
    res.send("please write the right shortURL");
  }
  if (urlDatabase[url].userID !== userID) {
    res.send("it is not your shortURL")
  }
  urlDatabase[shortURL] = {
    longURL: newURL,
    userID: userID
  };
    res.redirect("/urls");
});

//delete element
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const url = checkShortURL(userID, urlDatabase, shortURL);
  if (!users[userID]) {
    return res.redirect("/login");
  }
  // // make sure every users can edit their own shortURL
  if (url !== shortURL) {
    return res.send("this shortURL does not exist");
  }
  if (urlDatabase[url].userID !== userID) {
    res.send("it is not your shortURL")
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID]) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_login", { user: null });
  }
});

//register
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID]) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_register", { user: null });
  }
});

//login post
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = getUserByEmail(email, users);
  if(!user) {
    return res.send("Please login with the right email");
  } 
  if (!bcrypt.compareSync(password, user.password)){
    return res.status(403).send("please enter the right password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
})      

//register post
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    return res.status(400).send("please enter the email and password");
  }
  let user = getUserByEmail(email,users)
  if(user){
    return res.status(400).send("this email already used");
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