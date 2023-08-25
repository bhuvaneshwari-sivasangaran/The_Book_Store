const express = require("express");
const ejs = require("ejs");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const connectDB = require("./server/database/connection");

const app = express();

dotenv.config({ path: "config.env" });

const PORT = process.env.PORT;

connectDB();

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");

app.use("/css", express.static(path.resolve(__dirname, "assets/css")));

app.use("/", require("./server/routes/router"));

app.listen(PORT, () => {
    console.log(`Application running on http://localhost:${PORT}`);
});
