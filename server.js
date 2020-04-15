const { Client } = require("pg");
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var admin = require("firebase-admin");
//app.use(express.json())
const firebaseConfig = {
  apiKey: "AIzaSyAfTS_Gehnvxct7oVDSyfO9Ob92SFWwwQM",
  authDomain: "partyplanner-7131d.firebaseapp.com",
  databaseURL: "https://partyplanner-7131d.firebaseio.com",
  projectId: "partyplanner-7131d",
  storageBucket: "partyplanner-7131d.appspot.com",
  messagingSenderId: "736310198115",
  appId: "1:736310198115:web:5b083a51f683218106dd56",
  measurementId: "G-3NBTPPY1Z8",
};

admin.initializeApp(firebaseConfig);

app.use(
  bodyParser.json({
    limit: "100mb",
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  user: "iwrtvabsdejgqf",
  host: "ec2-52-23-14-156.compute-1.amazonaws.com",
  database: "d9mei743sg6bhj",
  password: "756d42202363d52c901b7b11ec186f226fab4990410aaf90d3e50419cf7ef741",
  port: 5432,
});

/*const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "partyplanner",
  password: "elrossetto",
  port: 5432
});*/

app.get("/eventos", async (req, res) => {
  const rows = await getAllEvents();
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/buscaEventoPorId", async (req, res) => {
  const rows = await buscaEventoPorId(req.query.id);
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/buscaEventoPorNome", async (req, res) => {
  const rows = await buscaEventoPorNome(req.query.nome);
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.post("/verifyToken", (req, res) => {
  const reqJson = req.body;
  console.log(reqJson);
  admin
    .auth()
    .verifyIdToken(reqJson.token)
    .then(function (decodedToken) {
      let uid = decodedToken.uid;
      res.setHeader("content-type", "application/json");
      res.send({ isValid: true });
    })
    .catch(function (error) {
      console.error(error);
      res.setHeader("content-type", "application/json");
      res.send({ isValid: false });
    });
});

app.post("/eventos", async (req, res) => {
  let result = {};
  try {
    const reqJson = req.body;
    await addNewEvent(
      reqJson.name,
      reqJson.capacidade,
      reqJson.local,
      reqJson.data,
      reqJson.descricao,
      reqJson.foto
    );
    result.success = true;
  } catch (e) {
    result.success = false;
  } finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }
});

app.listen(process.env.PORT || 8080, () =>
  console.log("Web server is listening.. on port 8080")
);
start();

async function start() {
  try {
    await client.connect();
  } catch (e) {
    console.error("Falha na conexão ${e}");
  }
}

async function getAllEvents() {
  try {
    const results = await client.query(
      "SELECT *, to_char( data, 'DD/MM/YYYY') as data from event;"
    );
    return results.rows;
  } catch (e) {
    console.error("Falha na query ${e}");
    return false;
  }
}

async function buscaEventoPorId(id) {
  try {
    const results = await client.query(
      "SELECT *, to_char( data, 'DD/MM/YYYY') as data from event WHERE id= $1;",
      [id]
    );
    return results.rows;
  } catch (e) {
    console.error("Falha na query ${e}");
    return false;
  }
}

async function buscaEventoPorNome(nome) {
  try {
    const results = await client.query(
      "SELECT *, to_char( data, 'DD/MM/YYYY') as data from event WHERE position(LOWER($1) in LOWER(name)) > 0 ;",
      [nome]
    );
    return results.rows;
  } catch (e) {
    console.error("Falha na query ${e}");
    return false;
  }
}

async function addNewEvent(name, capacity, local, data, desc, foto) {
  try {
    await client.query(" SET datestyle = dmy;");
    await client.query(
      "INSERT INTO event (name,capacidade,local,data,descricao,foto) VALUES ($1,$2,$3,$4,$5,$6);",
      [name, capacity, local, data, desc, foto]
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
