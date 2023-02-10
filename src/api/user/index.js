import express from "express";
import createHttpError from "http-errors";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import {
  createTokens,
  verifyRefreshAndCreateNewTokens,
} from "../../lib/auth/tools.js";
import UsersModel from "./model.js";
import AccommodationsModel from "../accommodation/model.js";

const usersRouter = express.Router();

// GET MY ACCOMMODATIONS (HOST ONLY)

usersRouter.get(
  "/me/accommodations",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const accommodations = await AccommodationsModel.find({
        host: req.user._id,
      }).populate({ path: "host", select: "email" });

      if (accommodations) {
        res.send(accommodations);
      } else {
        next(
          createHttpError(
            404,
            `No accommodations hosted by user ${req.user._id} were found.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// REGISTER USER (ANY)

usersRouter.post("/register", async (req, res, next) => {
    try {
      const newUser = new UsersModel(req.body);
      const { _id } = await newUser.save();

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

// LOGIN (ANY)

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      const { accessToken, refreshToken } = await createTokens(user);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(401, `Credentials are not ok!`));
    }
  } catch (error) {
    next(error);
  }
});

// REFRESH TOKEN (ANY)

usersRouter.post("/refreshTokens", async (req, res, next) => {
  try {
    const { currentRefreshToken } = req.body;

    const { accessToken, refreshToken } = await verifyRefreshAndCreateNewTokens(
      currentRefreshToken
    );

    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

// GET ME

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.findById(req.user._id);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// GET

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;