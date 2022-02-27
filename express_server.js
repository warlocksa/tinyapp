const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

const generateRandomString = () => { 
  return Math.random().toString(36).substr(2, 6);
 }

const getUserById = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      const user = database[id];
      return user;
    }
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  const userID = req.cookies.user_id
  if(users[userID] === undefined) {
    const templateVars = { urls: urlDatabase, user: undefined };
    res.render("urls_index", templateVars);
  }else{
    const templateVars = { urls: urlDatabase, user: users[userID] };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  for (let url in urlDatabase) {
    if (longURL !== urlDatabase[url][longURL]) {
      const shortURL = generateRandomString();
      urlDatabase[shortURL][longURL] = longURL;
      console/log(longURL)
      return res.redirect("/urls")
    }
  }
  console.log(req.body);  
  res.send("Ok");         
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;

  res.render("urls_new", { user: users[userID]});
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]){
    return res.send("id is not login")
  }
  const longURL = urlDatabase[shortURL][longURL];
  res.render(longURL)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  const userID = req.cookies.user_id
  if (users[userID] === undefined) {
    return res.redirect("/login")
  } else {
    const templateVars = { shortURL, user: users[userID] };
    return res.render("urls_show", templateVars);
  }
})

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[shortURL][longURL] = newURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  let user = getUserById(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  bcrypt.compare(user.password, hashedPassword)
  .then((result) => {
    if (result) {
      res.cookie("user_id", user.id)
      return res.redirect('/urls')
    } else {
      return res.status(403).send('please enter the right password');
    }
  });

  // if (user.password === password){
  //   res.cookie("user_id", user.id)
  //   return res.redirect('/urls')
  // }
  // else{
  //   return res.status(403).send('please enter the right password');
  // }
});

app.get("/login",(req,res) => {
  return res.render("urls_login", { user: null })
})

app.get("/logout", (req,res) => {
  return res.redirect("/urls") 
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  return res.render("urls_register", { user: null });
});

app.post("/register", (req, res) => {
  const { email, password}  = req.body;
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(email === '' || password === '' ) {
    return res.status(400).send('please enter the right email and password');
  }
  for (let key in users) {
    if (email === users[key][email]){
      return res.status(400).send('this email already used');
    }
  }
  users[user_id] = { id: user_id, email, password: hashedPassword };
  res.cookie("user_id", user_id);
  res.redirect("/urls");
  // const user_id = generateRandomString();
  // const { email, password } = req.body;
  // console.log(`password is ${password}`);
  // const hashedPassword = bcrypt.hashSync(password, 10);

  // if (!email || !password) {
  //   res
  //     .status(400)
  //     .send(
  //       "Registration failed. Email and/or Password fields cannot be empty."
  //     );
  // } else {
  //   users[user_id] = { id: user_id, email, password: hashedPassword };
  //   res.cookie("user_id", user_id);
  //   res.redirect("/urls");
  // }
  });

app.get("/", (req, res) => {
  res.send("Hello!");
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
