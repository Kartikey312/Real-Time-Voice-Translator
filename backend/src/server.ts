import express from "express";
import type {
  Request,
  Response,
  NextFunction,
} from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 8000;

// Error debugging
app.use((req, _res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ uploads folder created");
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, uploadDir);
  },

  filename: (
    _req,
    file,
    cb
  ) => {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  },
});

const upload = multer({
  storage,
});

// Health route
app.get(
  "/",
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Backend Running",
    });
  }
);

// Upload route
app.post(
  "/upload",
  upload.single("audio"),
  (
    req: Request,
    res: Response
  ) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      console.log(
        "========== FILE UPLOADED =========="
      );

      console.log(req.file);

      res.status(200).json({
        success: true,
        message:
          "Audio uploaded successfully",
        fileName:
          req.file.filename,
      });
    } catch (error) {
      console.error(
        "Upload Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  }
);

// Global error handler
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});