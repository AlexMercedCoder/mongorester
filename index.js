const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

////////////////////////
// reqInjector
///////////////////////

const reqInjector = (key, injectable) => {
  return (req, res, next) => {
    req[key] = injectable;
    next();
  };
};

///////////////////////////////////
// CB LOG
///////////////////////////////////
const cbLog = (key, message) => {
  console.log("\x1b[35m", `${key}:`, "\x1b[33m", message);
};

///////////
//Rester
///////////

const defaultConfig = {
  indexQuery: () => {
    return {};
  },
  middleware: [(req, res, next) => next()],
  config: { timestamps: true },
};

const rester = (name, schema, config = {}) => {
  const configs = { ...defaultConfig, ...config };

  const {
    indexQuery,
    middleware,
    schemaConfig,
    index,
    show,
    destroy,
    update,
    create,
  } = configs;
  const Model = model(name, new Schema(schema, schemaConfig));
  const router = Router();

  router.use(...middleware);

  //INDEX
  router.get("/", async (req, res) => {
    if (index) {
      index(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.find(indexQuery(req, res)));
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    }
  });

  //SHOW
  router.get("/:id", async (req, res) => {
    if (show) {
      show(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.findById(req.params.id));
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    }
  });

  //CREATE
  router.post("/", async (req, res) => {
    if (create) {
      create(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.create(req.body));
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    }
  });

  //PUT
  router.put("/:id", async (req, res) => {
    if (update) {
      update(req, res, Model);
    } else {
      try {
        res.status(200).json(
          await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
          })
        );
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    }
  });

  //DELETE
  router.delete("/:id", async (req, res) => {
    if (destroy) {
      destroy(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.findByIdAndRemove(req.params.id));
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    }
  });

  return [Model, router];
};

////////////
// authy
////////////

userModel = {
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
};

const authy = (uModel = {}, config = { timestamps: true }, options = {}) => {
  const { secret = "cheese", tokenConfig = {} } = options;
  const theUser = { ...userModel, ...uModel };

  const userSchema = new Schema(theUser, config);

  const User = model("User", userSchema);

  //AUTH MIDDLEWARE
  const auth = (req, res, next) => {
    try {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        const payload = jwt.verify(token, secret);
        if (payload) {
          req.payload = payload;
          next();
        } else {
          res.status(400).send("Failed Authentication");
        }
      } else {
        res.status(400).send("NO AUTHORIZATION HEADER WITH BEARER TOKEN");
      }
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  };

  /////////
  // User Router
  /////////

  const router = Router();

  router.post("/register", async (req, res) => {
    try {
      req.body.password = bcrypt.hashSync(req.body.password);
      const user = await User.create(req.body);
      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user) {
        const match = bcrypt.compareSync(password, user.password);
        if (match) {
          const { password: pw, ...theUser } = user._doc;
          const token = jwt.sign(theUser, secret, tokenConfig);
          res.status(200).json({ token });
        } else {
          res.status(400).json({ error: "PASSWORD DOES NOT MATCH" });
        }
      } else {
        res.status(400).json({ error: "NO SUCH USER" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  });

  /////////////////
  // Custom Rester
  /////////////////

  const defaultConfig2 = {
    indexQuery: (req, res) => {
      return { username: req.payload.username };
    },
    middleware: [(req, res, next) => next(), auth],
    config: { timestamps: true },
  };

  const authrester = (name, schema, config = {}) => {
    const configs = { ...defaultConfig2, ...config };
    const theSchema = {
      ...schema,
      ...{ username: { type: String, required: true } },
    };

    const {
      indexQuery,
      middleware,
      schemaConfig,
      index,
      show,
      destroy,
      update,
      create,
    } = configs;
    const Model = model(name, new Schema(theSchema, schemaConfig));
    const router = Router();

    router.use(...middleware);

    //INDEX
    router.get("/", async (req, res) => {
      if (index) {
        index(req, res, Model);
      } else {
        try {
          res.status(200).json(await Model.find(indexQuery(req, res)));
        } catch (error) {
          console.log(error);
          res.status(400).json({ error });
        }
      }
    });

    //SHOW
    router.get("/:id", async (req, res) => {
      if (show) {
        show(req, res, Model);
      } else {
        try {
          res.status(200).json(await Model.findById(req.params.id));
        } catch (error) {
          console.log(error);
          res.status(400).json({ error });
        }
      }
    });

    //CREATE
    router.post("/", async (req, res) => {
      if (create) {
        create(req, res, Model);
      } else {
        try {
          req.body.username = req.payload.username;
          res.status(200).json(await Model.create(req.body));
        } catch (error) {
          console.log(error);
          res.status(400).json({ error });
        }
      }
    });

    //PUT
    router.put("/:id", async (req, res) => {
      if (update) {
        update(req, res, Model);
      } else {
        try {
          const item = await Model.findById(req.params.id);
          if (item) {
            if (item.username === req.payload.username) {
              res.status(200).json(
                await Model.findByIdAndUpdate(req.params.id, req.body, {
                  new: true,
                })
              );
            } else {
              res.status(400).json({ error: "NOT THIS USERS ITEM" });
            }
          } else {
            res.status(400).json({ error: "Item Doesn't exist" });
          }
        } catch (error) {
          console.log(error);
          res.status(400).json({ error });
        }
      }
    });

    //DELETE
    router.delete("/:id", async (req, res) => {
      if (destroy) {
        destroy(req, res, Model);
      } else {
        try {
          const item = await Model.findById(req.params.id);
          if (item) {
            if (item.username === req.payload.username) {
              res
                .status(200)
                .json(await Model.findByIdAndRemove(req.params.id));
            } else {
              res.status(400).json({ error: "NOT THIS USERS ITEM" });
            }
          } else {
            res.status(400).json({ error: "Item Doesn't exist" });
          }
        } catch (error) {
          console.log(error);
          res.status(400).json({ error });
        }
      }
    });

    return [Model, router];
  };

  return [User, auth, router, authrester];
};

////////////////
// connmon
////////////////

const connmon = (uri) => {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  mongoose.connection
    .on("open", () => cbLog("MONGO", "CONNECTED TO MONGODB"))
    .on("close", () => cbLog("MONGO", "DISCONNECTED TO MONGODB"))
    .on("error", (error) => {
      cbLog("MONGO", error);
    });

  return mongoose;
};

module.exports = { rester, authy, connmon, reqInjector, cbLog };
