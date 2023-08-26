const postRouter = require("express").Router();
const { db } = require("../config/database");
require("dotenv").config();
const { createResponse } = require("../utils/response");
const { comparePassword } = require("../utils/utility");
const { generateJwtToken } = require("../utils/middleware");

postRouter.post("/login", async (req, res) => {
  const errors = {};
  try {
    const { username, password } = req.body;
    if (!username) errors.username = "username name cant be empty";
    if (!password) errors.password = "password name cant be empty";
    if (Object.keys(errors).length > 0) return createResponse(res, 400, errors);
    await db
      .query(
        `
            SELECT id, password
            FROM "user"
            WHERE username='${username}';
        `
      )
      .then(async (user) => {
        if (user.rows.length == 0)
          return createResponse(res, 400, {
            message: "invalid username or password",
          });
        if (!(await comparePassword(password, user.rows[0].password)))
          return createResponse(res, 400, {
            message: "invalid username or password",
          });
        token = generateJwtToken(user.rows[0], 15);
        tokenRefresh = generateJwtToken(user.rows[0], 60 * 24 * 7);
        res.cookie("token", tokenRefresh, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
        await db.query(`
                UPDATE "user"
                SET token='${token}'
                WHERE username='${username}';`);
        return createResponse(res, 200, { message: token });
      })
      .catch(async (error) => {
        console.log(error);
        return createResponse(res, 500, { message: "Internal server error" });
      });
  } catch (error) {
    console.log(error);
    return createResponse(res, 500, { message: "Internal server error" });
  }
});

postRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
    });
    return createResponse(res, 200, { message: "logout berhasil" });
  } catch (error) {
    console.log(error);
    return createResponse(res, 500, { message: "Internal server error" });
  }
});

module.exports = postRouter;
