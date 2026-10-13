const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const { connectDatabase, isDatabaseConnected } = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const analysisRoutes = require("./routes/analysisRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Resume parser backend is running.",
    mongodbConnected: isDatabaseConnected(),
  });
});

app.use("/api", analysisRoutes);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
