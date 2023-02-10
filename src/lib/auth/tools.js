import jwt from "jsonwebtoken";
import UsersModel from "../../api/user/model.js";

const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken = (accessToken) =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res(originalPayload);
    })
  );

const createRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyRefreshToken = (accessToken) =>
  new Promise((resolve, reject) =>
    jwt.verify(
      accessToken,
      process.env.REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, originalPayload) => {
        if (err) reject(err);
        else resolve(originalPayload);
      }
    )
  );

export const createTokens = async (user) => {
  console.log("creating tokens");
  const accessToken = await createAccessToken({
    _id: user._id,
    role: user.role,
  });
  console.log("accessToken", accessToken);
  const refreshToken = await createRefreshToken({ _id: user._id });
  console.log("refreshToken", refreshToken);
  user.refreshToken = refreshToken;

  await user.save();

  return { accessToken, refreshToken };
};

export const verifyRefreshAndCreateNewTokens = async (currentRefreshToken) => {
  try {
    const refreshTokenPayload = await verifyRefreshToken(currentRefreshToken);

    const user = await UsersModel.findById(refreshTokenPayload._id);
    if (!user)
      throw new createHttpError(
        404,
        `User with id ${refreshTokenPayload._id} not found!`
      );
    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(user);
      return { accessToken, refreshToken };
    } else {
      throw new createHttpError(401, "Refresh token not valid!");
    }
  } catch (error) {
    throw new createHttpError(401, "Refresh token not valid!");
  }
};