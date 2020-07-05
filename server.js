const { Client } = require("pg");
const express = require("express");
const app = express();
var bodyParser = require("body-parser");

//require("dotenv-safe").load();

var jwt = require("jsonwebtoken");
//app.use(express.json())

let allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};
app.use(allowCrossDomain);

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
  user: "hfilqnklvsxyuj",
  host: "ec2-35-169-254-43.compute-1.amazonaws.com",
  database: "dah917m0k70f00",
  password: "94ef9d6584756e6a01a54cf18eeae4c9d3639cf18b6035294adad956ba4f2725",
  port: 5432,
});

/*const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "partyplanner",
  password: "elrossetto",
  port: 5432
});*/

app.get("/getEvents", async (req, res) => {
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
  const rows = await buscaEventoPorNome(req.query.name);
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/buscaEventoPorIdCriador", async (req, res) => {
  const rows = await getMyEvents(req.query.creator_id);
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/getCategories", async (req, res) => {
  const rows = await getAllCategories();
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/getLocais", async (req, res) => {
  const rows = await getAllLocations();
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/getPresencas", async (req, res) => {
  const rows = await getPresencas(req.query.userId);
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.get("/getUsers", async (req, res) => {
  const rows = await getAllUsers();
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
});

app.post("/createEvent", async (req, res) => {
  let result = {};
  try {
    const reqJson = req.body;
    await addNewEvent(
      reqJson.title,
      reqJson.subtitle,
      reqJson.details,
      reqJson.date,
      reqJson.createdAt,
      reqJson.photo,
      reqJson.locationId,
      reqJson.price,
      reqJson.categoryId,
      reqJson.creatorId
    );
    result.success = true;
  } catch (e) {
    result.success = false;
  } finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }
});

app.post("/createLocal", async (req, res) => {
  let result = {};
  try {
    const reqJson = req.body;
    await addNewLocal(
      reqJson.nome,
      reqJson.endereco,
      reqJson.estado,
      reqJson.cidade,
      reqJson.capacidade
    );
    console.log("API retornou");
    result.success = true;
  } catch (e) {
    result.success = false;
  } finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }
});

app.post("/marcaPresenca", async (req, res) => {
  let result = {};
  try {
    const reqJson = req.body;
    await marcaPresenca(reqJson.userId, reqJson.eventId);
    console.log("API retornou");
    result.success = true;
  } catch (e) {
    result.success = false;
  } finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }
});

app.post("/createUser", async (req, res) => {
  let result;
  try {
    const reqJson = req.body;
    await createUser(
      reqJson.fullName,
      reqJson.userName,
      reqJson.email,
      reqJson.password,
      reqJson.birthday,
      reqJson.auth_token,
      reqJson.photo
    );
    result = true;
  } catch (e) {
    console.error(e.message);
    result = false;
  } finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }
});

app.post("/checkLogin", async (req, res) => {
  try {
    const reqJson = req.body;
    const rows = await login(reqJson.email, reqJson.password);
    res.setHeader("content-type", "application/json");
    if (rows.length == 0) res.send({ login: false });
    else {
      res.send(JSON.stringify(rows[0]));
    }
  } catch (error) {
    console.error(error.message);
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
    console.error("Falha na conexão " + e.message);
  }
}

async function getAllEvents() {
  try {
    const results = await client.query(
      "SELECT e.*, l.nome as local_nome, to_char(event_date, 'DD/MM/YYYY') as event_date from event as e inner join local as l on e.local_id = l.id;"
    );
    return results.rows;
  } catch (e) {
    console.error("Falha na query: " + e);
    return false;
  }
}

async function getAllCategories() {
  try {
    const results = await client.query(
      "SELECT * from category order by name asc;"
    );
    return results.rows;
  } catch (error) {
    console.error("Falha na query" + e);
    return false;
  }
}

async function getAllLocations() {
  try {
    const results = await client.query(
      "SELECT * from local order by nome asc;"
    );
    return results.rows;
  } catch (error) {
    console.error("Falha na query" + e);
    return false;
  }
}

async function getPresencas(userId) {
  try {
    const results = await client.query(
      "SELECT * from presence where user_id = $1;",
      [userId]
    );
    return results.rows;
  } catch (error) {
    console.error("Falha na query" + e);
    return false;
  }
}

async function getAllUsers() {
  try {
    const results = await client.query("SELECT * from app_user;");
    return results.rows;
  } catch (error) {
    console.error("Falha na query" + e);
    return false;
  }
}

async function buscaEventoPorId(id) {
  try {
    const results = await client.query(
      "SELECT e.*, l.nome as local_nome, to_char(event_date, 'DD/MM/YYYY') as event_date from event as e inner join local as l on e.local_id = l.id where e.id = $1;",
      [id]
    );
    return results.rows;
  } catch (e) {
    console.error("Falha na query: " + e);
    return false;
  }
}

async function buscaEventoPorNome(name) {
  try {
    const results = await client.query(
      "SELECT *, to_char( date, 'DD/MM/YYYY') as data from event WHERE position(LOWER($1) in LOWER(title)) > 0 ;",
      [name]
    );
    return results.rows;
  } catch (e) {
    console.error("Falha na query: " + e);
    return false;
  }
}

async function addNewEvent(
  title,
  subtitle,
  details,
  date,
  createdAt,
  photo,
  locationId,
  price,
  categoryId,
  creatorId
) {
  try {
    await client.query(" SET datestyle = dmy;");
    await client.query(
      "INSERT INTO event (title,subtitle,details,event_date,created_at,photo,local_id,price,category_id,creator_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);",
      [
        title,
        subtitle,
        details,
        date,
        createdAt,
        photo,
        locationId,
        price,
        categoryId,
        creatorId,
      ]
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function addNewLocal(nome, endereco, estado, cidade, capacidade) {
  try {
    await client.query(
      "INSERT INTO local (nome,endereco,estado,cidade,capacidade) VALUES ($1,$2,$3,$4,$5);",
      [nome, endereco, estado, cidade, capacidade]
    );
    console.log("Chamou aqui");
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function createUser(
  fullName,
  userName,
  email,
  password,
  birthday,
  auth_token,
  photo
) {
  try {
    await client.query(" SET datestyle = dmy;");
    await client.query(
      "INSERT INTO app_user ( user_name,user_handle,email,password, birthday, auth_token, photo) VALUES ($1,$2,$3,crypt($4, gen_salt('bf')),$5,$6,$7);",
      [fullName, userName, email, password, birthday, auth_token, photo]
    );
    return true;
  } catch (e) {
    console.error("Falha na query" + e.message);
    return false;
  }
}

async function login(email, password) {
  try {
    let result = await client.query(
      "SELECT * from app_user where email = $1 and password = crypt($2,password);",
      [email, password]
    );
    return result.rows;
  } catch (e) {
    console.error("Falha na query " + e.message);
    return false;
  }
}

async function getMyEvents(userId) {
  try {
    let result = await client.query(
      "SELECT *, to_char( event_date, 'DD/MM/YYYY') as date from event where creator_id = $1;",
      [userId]
    );
    return result.rows;
  } catch (e) {
    console.error("Falha na query " + e.message);
    return false;
  }
}

async function marcaPresenca(userId, eventId) {
  try {
    let result = await client.query(
      "INSERT into presence (user_id,event_id) values ($1,$2);",
      [userId, eventId]
    );
    return result.rows;
  } catch (error) {
    console.error("Falha na query" + error.message);
    return false;
  }
}
