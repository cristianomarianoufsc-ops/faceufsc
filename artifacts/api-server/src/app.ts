import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) throw new Error("SESSION_SECRET is required");

const allowedOrigins = [
  /\.vercel\.app$/,
  /\.replit\.app$/,
  /\.replit\.dev$/,
  /localhost/,
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok = allowedOrigins.some(p =>
        typeof p === "string" ? p === origin : p.test(origin)
      );
      cb(null, ok);
    },
    credentials: true,
  })
);

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: process.env["NODE_ENV"] === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "faceufsc-secret-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
