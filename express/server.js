"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const { readFile, readFileSync } = require("fs").promises;
const morgan = require("morgan");

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>PY - Test Pipeline - Commit from diff. org. - Hello from Express.js!</h1>");
  res.end();
});

//Define path where all json files are stored JSON

router.get("/countries", async (req, res) => {
  const file_path = path.resolve("assets/jsons/countries.json");
  return await readJSON_AND_SendResponse(file_path, req, res);
});

//Middlewares
app.use(morgan("dev")); // Logging

app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

async function readJSON_AND_SendResponse(file_path, req, res) {
  const fs = require("fs");
  await fs.readFile(file_path, "utf8", (err, file) => {
    // check for any errors
    if (err) {
      console.error("Error while reading the file:", err);
      return;
    }
    try {
      let data = JSON.parse(file);
      // output the parsed data
      // console.log(data);

      let fetch_Country = req.query.country;
      let fetch_isTricolor = req.query.istricolor;

      if (fetch_Country && fetch_isTricolor) {
        //to convert to string
        fetch_Country = "" + fetch_Country;
        //to convert to lowercase
        fetch_Country = fetch_Country.toLowerCase();

        //to convert string into boolean
        fetch_isTricolor = fetch_isTricolor === "true";

        data = data.filter(function (item) {
          return (
            item.country.toLowerCase() == fetch_Country &&
            item.has_tricolor_flag == fetch_isTricolor
          );
        });
      } else if (fetch_Country && !fetch_isTricolor) {
        //to convert to string
        fetch_Country = "" + fetch_Country;
        //to convert to lowercase
        fetch_Country = fetch_Country.toLowerCase();

        data = data.filter(function (item) {
          return item.country.toLowerCase() == fetch_Country;
        });
      } else if (!fetch_Country && fetch_isTricolor) {
        //to convert string into boolean
        fetch_isTricolor = fetch_isTricolor === "true";

        data = data.filter(function (item) {
          return item.has_tricolor_flag == fetch_isTricolor;
        });
      }
      res.type("application/json");
      res.send(data);
    } catch (err) {
      console.error("Error while parsing JSON data:", err);
    }
  });
}

module.exports = app;
module.exports.handler = serverless(app);
