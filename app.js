const express = require('express');
const app = express();
const port = 7000;
const mongoose = require('./db/conn');
const router=require("./routes/router")
const cors=require("cors")
 

app.use(express.json());
app.use(cors())
app.use(router)
app.listen(port, () => {
    console.log("Server started on port", port);
});