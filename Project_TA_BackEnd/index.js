const express = require("express");

const users = require("./routes/users");
const sellers = require("./routes/sellers");
const midtrans = require("./routes/midtrans");

const app = express();
app.set("port", 3000);
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api", users);
app.use("/api", sellers);
app.use("/api", midtrans);

app.listen(app.get("port"), () => {
    console.log(`Server started at http://localhost:${app.get("port")}`);
});

module.exports = app;     