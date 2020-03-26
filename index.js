const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();

//Connection to de database and seeding it for testing

const db_name = path.join(__dirname, "data", "faq.db");
const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'faq.db'");
});

const sql_create = `CREATE TABLE IF NOT EXISTS faq (
    Faq_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    domaine TEXT NOT NULL,
    question TEXT NOT NULL,
    reponse TEXT NOT NULL
  );`;

const sql_create_user = `CREATE TABLE IF NOT EXISTS user (
    email TEXT NOT NULL,
    username TEXT PRIMARY KEY NOT NULL,
    password TEXT NOT NULL
);`;

db.run(sql_create, err => {
    if (err) {
        return console.error(err.message);
    }
});

db.run(sql_create_user, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("successful creation of user table")
});


//Connection to the views and displaying of the web pages
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));


/*
//#region  Database seeding
const sql_insert = `INSERT INTO faq (question,reponse) VALUES
('Comment donner les droits sur un fichier ?', 'Utiliser la commande chmod'),
('Comment utiliser python dans la console ?', 'utiliser la commande python3'),
('Langage pour la structure du web', 'html');`;

const sql_insert = `DROP TABLE user;`;


db.run(sql_insert, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful delete of users ");
});

*/

//#region GET METHODS

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/faq", (req, res) => {
    const sql = "SELECT * FROM faq ORDER BY question"
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("faq", { model: rows });

    });
});

app.get("/faq/:domaine", (req, res) => {
    const domaine = req.params.domaine;
    const sql = "SELECT * FROM faq WHERE domaine = ? ORDER BY question"
    db.all(sql, domaine, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("faq", { model: rows });

    });
});

app.get("/accueil", (req, res) => {
    res.render("accueil");
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM faq WHERE Faq_ID = ?";
    db.run(sql, id, err => {
        res.redirect("/faq");
    });
});


//#endregion

//#region POST METHODS

app.post("/create", (req, res) => {
    const sql = "INSERT INTO faq (domaine, question, reponse) VALUES (?, ?, ?)";
    const faq = [req.body.domaine, req.body.question, req.body.reponse];
    db.run(sql, faq, err => {
        res.redirect("/faq");
    });
});


app.post("/faq/query", (req, res) => {
    const sql = "SELECT * FROM faq WHERE question like '%" + req.body.query + "%' or reponse like '%" + req.body.query + "%';";
    db.all(sql, [], v => {
        if (err) {
            return console.error(err.message);
        }
        res.render("faq", { model: rows });
    });
});

app.post("/signup", (req, res) => {
    const sql = "INSERT INTO user (email, username, password) VALUES (?, ?, ?)";
    const email = req.body.email;
    const username = req.body.username;
    var password = req.body.password;
    var error_verif = 0;
    let salt_rounds = 10;
    bcrypt.hash(password, salt_rounds, (err, pass_hash) => {
        if (!err) {
            password = pass_hash;
        } else {
            console.log("Error :", err)
        }
    })
    const user = [email, username, password]
    try {
        db.run(sql, user, err => {
            if (err) {
                error_verif = 1;
                console.log("Error :", err)
            }
        });
    } catch (err) {};
    console.log(error_verif)
    if (error_verif) {
        res.redirect("/signup");
        console.log("User already exists")
    } else {
        res.redirect("/signin");
    }

});

app.post("/signin", (res, req) => {
    const username = req.body.username;
    var password = req.body.password;
})

//#endregion

app.listen(3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});