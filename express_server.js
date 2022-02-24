const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
function generateRandomString() { return Math.random().toString(36).substr(2, 6); }

const getUserById = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      const user = database[id]
      return user
    }
  }
}

  app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/new", (req, res) => {
  res.render("urls_new", { user: null});
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
})

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  console.log(email,password)
  let user = getUserById(email, users);
  if (user.password === password){
    res.cookie("user_id", user.id)
    return res.redirect('/urls')
  }
  else{
    return res.status(403).send('error 403');
  }
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
  const { email, password } = req.body;
  const user_id = generateRandomString();
  if(email === '' || password === '' ) {
    
    return res.status(400).send('error 400');
  }
  for (let key in users) {
    if (email === users[key][email]){
      return res.status(400).send('error 400');
      
    }
  }
  users[user_id] = { id: user_id, email, password: password };
  
  res.cookie("user_id", user_id);
  res.redirect("/urls");
  });

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
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
