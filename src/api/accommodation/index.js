import express from "express";
import createHttpError from "http-errors";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import AccommodationsModel from "./model.js";

const accommodationsRouter = express.Router();

// GET ALL (BOTH)

accommodationsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accommodations = await AccommodationsModel.find().populate({
      path: "host",
      select: "email",
    });

    res.status(200).send(accommodations);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC (BOTH)

accommodationsRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accommodation = await AccommodationsModel.findById(
      req.params.id
    ).populate({ path: "host", select: "email" });

    if (accommodation) {
      res.status(200).send(accommodation);
    } else {
      next(
        createHttpError(
          404,
          `No accommodation with id ${req.params.id} was found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST ACCOMMODATION (HOST ONLY)

accommodationsRouter.post(  "/", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const newAccommodation = new AccommodationsModel(req.body);
      const { _id } = await newAccommodation.save();

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

// EDIT ACCOMMODATION (HOST ONLY)

accommodationsRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAccommodation = await AccommodationsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedAccommodation) {
      res.status(204).send(updatedAccommodation);
    } else {
      next(
        createHttpError(
          404,
          `Accommodation with id ${req.params.id} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE ACCOMMODATION (HOST ONLY)

accommodationsRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const deletedAccommodation = await AccommodationsModel.findByIdAndDelete(
        req.params.id
      );
      if (deletedAccommodation) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Accommodation with id ${req.params.id} not found.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default accommodationsRouter;