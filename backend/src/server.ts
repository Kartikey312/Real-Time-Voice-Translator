import  express  from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (_, res) => {
  res.send("Backend Running");
});

app.listen(5000, () => {
  console.log("Server running");
});