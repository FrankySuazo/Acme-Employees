// imports here for express and pg
const express = require("express");
const app = express();
const path = require("path");
const pg = require("pg");
const { ppid } = require("process");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_noes_db"
);
const port = process.env.PORT || 3000;

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
ppid.use(express.static(path.join(__dirname, "../client/dist")));

// static routes here (you only need these for deployment)
app.get("api/notes", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * from notes 
        `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// app routes here

// create your init function
const init = async () => {
  await client.connect();
  const SQL = `
        DROP TABLE IF EXIST notes;
        CREATE TABLE notes(
            id SERIAL PRIMARY KEY,
            txt VARCHAR(255),
            starred BOOLEAN DEFAULT FALSE 
        );
        INSERT INTO notes(starred, txt) VALUES(false, 'learn express');
        INSERT INTO notes(txt, starred) VALUES('write SQL queries', true);
        INSERT INTO notes(txt) VALUES('create routes');
    `;
  client.query(SQL);
  console.log("YOou are connected to the database!");
};
// init function invocation
app.listen(port, () => {
  init();
  console.log("Server is runnig!");
});
