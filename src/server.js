import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  badRequestHandler,
  forbiddenHandler,
  genericServerErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import mongoose from "mongoose";
import usersRouter from "./api/user/index.js";
import accommodationsRouter from "./api/accommodation/index.js";
import authRouter from "./api/authRouter/index.js";
import dotenv  from 'dotenv';
dotenv.config();

const server = express();
const port = process.env.PORT || 3001;

server.use(cors()
);

server.use(express.json());

server.use("/users", usersRouter);
server.use("/accommodations", accommodationsRouter);
server.use("/auth", authRouter)

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

mongoose.connect(process.env.MONGO_URL);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server is up and running on port " + port);
});