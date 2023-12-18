// DB 

const mariadb = require('mariadb');
require('dotenv').config();
let cors = require('cors');

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_DTB,
    user: process.env.DB_USER,
    password: process.env.DB_PWD
});

const express = require('express');
const app = express();

app.use(express.json());
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/users', async(req, res) => {
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM utilisateur");
        res.status(200).json(rows);
    }
    catch{
        res.status(500).json({error: "Erreur"});
    }
    let date = new Date();
    // console.log(date);
});


app.post('/users/add', async(req, res) => {
    let conn;

    console.log(req.body.nom)
    conn = await pool.getConnection();
    console.log("Connexion réussie")

    // console.log(req.body.prenom)
    await conn.query("INSERT INTO utilisateur (nom, prenom, email) VALUES (?, ?, ?)", [req.body.nom, req.body.prenom, req.body.email]);
    // console.log("Requête réussie")
    res.status(201).json("Utilisateur ajouté");
});


app.put('/users/update/:email', async(req, res) => {
    let conn;
        conn = await pool.getConnection();
        await conn.query("UPDATE utilisateur SET nom = ?, prenom = ? WHERE email = ?", [req.body.nom, req.body.prenom, req.body.email]);
        res.status(201).json('Utilisateur modifié');
});

app.delete('/users/delete/:email', async(req, res) => {
    let conn;
        conn = await pool.getConnection();
        await conn.query("DELETE FROM utilisateur WHERE email = ?", [req.body.email]);
        res.status(201).json('Utilisateur supprimé');
});


app.post('/comments/add', async(req, res) => {
    let conn;
    conn = await pool.getConnection();
    userID = await conn.query("SELECT id FROM utilisateur WHERE email = ?", [req.body.email]);

    conn = await pool.getConnection();
    techID = await conn.query("SELECT id FROM technologie WHERE nomTechno = ?", [req.body.nomtech]);

    // console.log(userID[0].id);
    datenow = new Date();
    conn = await pool.getConnection();
    await conn.query("INSERT INTO commentaire (description, dateCreationCommentaire, utilisateur_id, technologie_id) VALUES (?, ?, ?, ?)", [req.body.description, datenow, userID[0].id, techID[0].id]);
    res.status(201).json("Commentaire ajouté");
});

app.get('/comments/:email', async(req, res) => {
    let conn;
    conn = await pool.getConnection();
    // console.log(req.body.email)
    userID = await conn.query("SELECT id FROM utilisateur WHERE email = ?", [req.body.email]);
    // console.log(userID[0].id)
    const rows = await conn.query("SELECT * FROM commentaire WHERE utilisateur_id = ?", [userID[0].id]);
    res.status(200).json(rows);
});

app.get('/comments/tech/:nomtech', async(req, res) => {
    let conn;
    conn = await pool.getConnection();
    // console.log(req.body.nomtech)
    techID = await conn.query("SELECT id FROM technologie WHERE nomTechno = ?", [req.body.nomtech]);
    // console.log(techID[0].id)
    const rows = await conn.query("SELECT * FROM commentaire WHERE technologie_id = ?", [techID[0].id]);
    res.status(200).json(rows);
});

app.get('/commentsfilter/dateComment', async(req, res) => {
    let conn;
    conn = await pool.getConnection();


    const rows = await conn.query("SELECT * FROM commentaire WHERE DATE(dateCreationCommentaire) > ?", [req.body.dateComment]);
    console.log(rows);
    res.status(200).json(rows);
});

app.listen(3000, () => {
    console.log('Le serveur écoute sur le port 3000');
});