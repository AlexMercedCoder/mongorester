# Mongo Rester

### by Alex Merced

Spin up a Full Crud Mongo Express API with one function

## How it works

Install it...

`npm install mongorester`

require it...

```js
const { rester } = require("mongorester");
```

Pass the rester function a model name string and schema definition object. The function will return an array with the model and the router with 5 pre-made routes.

```js
//Generate Model and Router
const [Note, noteRouter] = rester("Note", { title: String, content: String });

//add extra routes if you want
noteRouter.get("/user/:username", async (req, res) => {
  res.json(await Note.find({ username: req.params.username }));
});

//Use the Router
app.use("/note/", noteRouter);
```

## The Pre-Made Routes

Here is the Routes that get created when using the rester function

```js
//INDEX
router.get("/", async (req, res) => {
  try {
    res.status(200).json(await Model.find({}));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//SHOW
router.get("/:id", async (req, res) => {
  try {
    res.status(200).json(await Model.findById(req.params.id));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//CREATE
router.post("/", async (req, res) => {
  try {
    res.status(200).json(await Model.create(req.body));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//PUT
router.put("/:id", async (req, res) => {
  try {
    res
      .status(200)
      .json(await Model.findByIdAndUpdate(req.params.id, req.body));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    res.status(200).json(await Model.findByIdAndRemove(req.params.id));
  } catch (error) {
    res.status(400).json({ error });
  }
});
```

## The Config Object

Can pass a third config object argument that'll help add middleware and configure your schema.

```js
//config object
const config = {
  middleware: [auth], //array of middleware function, must be an array
  config: { timestamps: false }, //second argument of Schema, default timestamps true
  indexQuery: (req, res) => {
    username: req.query.username;
  },
  //Function that takes req/res and returns object to query for index route
};

//Generate Model and Router
const [Note, noteRouter] = rester(
  "Note",
  { title: String, content: String },
  config
);
```

## Overriding Default Routes

You can pass an alternate route handler into the config object under the following keys:

- index
- show
- update
- create
- destroy

with the following function signature

`(req, res, model) => {}`

## authy

Another function inside Mongo Rester is Authy which will quickly implement JWT user authentication. (uses a bearer token)

```js
const { authy } = require("mongorester");
```

Using it is as easy as this...

```js
userSchema = {
  username: String,
  password: String,
  email: String,
};

schemaConfig = {
  timestamps: true,
};

options = {
  secret: "cheese",
  tokenConfig: {
    expiresIn: "1h",
  },
};

const [User, authMiddleware, authRouter, authRester] = authy(
  userSchema,
  schemaConfig,
  options
);
```

**User:** The user model.

**authMiddleware:** Middleware functions to protect routes. It will store the token payload in req.payload

**authRouter:** auth router with "/register" and "/login" post routes. THe login route will generate a token that holds all the user object except the password.

**authRester:** Like the rester function except it applies the authMiddleware to all routes, already has all CRUD routes like rester.

## connmon

Simple Mongo connection simplifier. Just pass it your mongo uri and it will return the connected mongoose object with basic event logs for open, close and error.

```js
const { connmon, rester, authy } = require("mongorester");

const mongoose = connmon(uri);
```

## reqInjector

Pass it a key and data and it will inject that data into the request object under that key. It returns a middleware function.

```js
const { reqInjector } = require("mongorester");
const { User, Blog } = require("./models");

//This makes all models available to all routes inside req.models
app.use(reqInjector("models", { User, Blog }));
```

## cbLog

In a lot of situations you have to pass a callback (think app.listen) which often just contains a console.log, so cbLog is a quick way to pass these messages in a colorful way.

cbLog(key, message)

```js
const {cbLog} = require("mongorester")

app.listen(PORT, cbLog("server", `Listening on ${PORT})`)

```
