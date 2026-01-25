import express from "express";
import cors from "cors";
import 'dotenv/config'
import { DbInstance } from "./config/db.config";
import { TTokenUser } from "./utils/Enums.utils";
import router from "./services/routes";
import webhook from "./services/webhook/webhook.route";

const app = express()
const port = process.env.PORT || 5000


app.use("/api/v1", webhook);
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get("/health",(req,res)=>{  
    res.send("Zinda hu bhai 😢 😎")
})

app.use("/api/v1",router)

DbInstance.then(async () => {
  console.log("Database Connected 🦊");

  app.listen(port, async () => {
    console.log(`🚀 Server is running on port 🚀: ${port}`);
  });
}).catch((err: any) => {
  console.log(`Can't Connect Server!`, err);
  process.exit(1);
});



declare global {
  namespace Express {
    interface Request {
      userData?: TTokenUser | undefined;
    }
  }
}
