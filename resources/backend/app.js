const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();


const PORT = config.port;
connectDB();

// Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'file://', 'null']
}))
const path = require("path");
// ... imports

app.use(express.json()); // parse incoming request in json format
app.use(cookieParser())

// Serve Static Uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'upload');
app.use('/upload', express.static(uploadDir));
console.log('📂 Serving upload from:', uploadDir);


// Root Endpoint
app.get("/", (req, res) => {
    res.json({ message: "Hello from POS Server!" });
})

// Other Endpoints
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));

// Global Error Handler
app.use(globalErrorHandler);


// Server
app.listen(PORT, () => {
    console.log(`☑️  POS Server is listening on port ${PORT}`);
})