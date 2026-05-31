import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

app.use(cors());

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/");
  },

  filename: (_, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  },
});

const upload = multer({ storage });

app.get("/", (_, res) => {
  res.send("Backend Running");
});

app.post(
  "/upload",
  upload.single("audio"),
  (req, res) => {

    console.log("File Uploaded");

    console.log(req.file);

    res.status(200).json({
      success: true,
      file: req.file?.filename,
    });
  }
);

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});