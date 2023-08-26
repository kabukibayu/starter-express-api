const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const deviceRouter = require("./src/routes/device");
const telemetryRouter = require("./src/routes/telemetry");
const userRouter = require("./src/routes/user");
const tokenRouter = require("./src/routes/token");
const { validateJwtToken } = require("./src/utils/middleware");

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "https://das-himace.vercel.app"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/device", validateJwtToken, deviceRouter);
app.use("/telemetry", validateJwtToken, telemetryRouter);
app.use("/user", userRouter);
app.use("/refresh-token", tokenRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});
