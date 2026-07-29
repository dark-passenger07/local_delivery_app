import express from "express"
import { Request, Response } from "express";
import dotenv from "dotenv"
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser"
import vendorRouter from "./routes/vendor.routes.js";
import productRouter from "./routes/product.routes.js";
import vendorCustomers from "./routes/vendor.customers.routes.js";
import customerSubscriptionRouter from "./routes/customers.subscription.routes.js";
import requestRouter from "./routes/requests.routes.js";
import cors from "cors"
import { Server } from "socket.io"
import http from "http"
import pushRouter from "./routes/push.notification.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => {
    console.log("-------------------")
    console.log(`User: ${userId} joined room`)
    console.log("-------------------")
    socket.join(String(userId))
    
  })
})


app.use((req, res, next) => {
  req.io = io;
  next();
});


// hard coded apis for develeopment will change this once the app is ready
const allowedOrigins = [
  'http://192.168.29.151:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8081'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});



app.use(express.json())
app.use(cookieParser())


const PORT = Number(process.env.PORT) || 5000;

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("App is working")
})

app.use("/auth", userRouter)
app.use("/vendor", vendorRouter)
app.use("/product", productRouter)
app.use("/customer", vendorCustomers)
app.use("/subscription", customerSubscriptionRouter)
app.use("/request", requestRouter)
app.use("/notification", pushRouter)


server.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`)
})





