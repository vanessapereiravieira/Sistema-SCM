require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path"); 

const app = express();

const autenticacao = require("../routes/autenticacao");
const chamados = require("../routes/chamados");
const manutencao_preventiva = require("../routes/manutencao_preventiva");

app.use(express.json());

// CORS para frontend na porta 5500
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

// Sessão
app.use(session({
    secret: "SCM@010203",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// CONFIGURAÇÃO PARA ACESSAR AS IMAGENS DA PASTA UPLOADS 
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(chamados);
app.use(manutencao_preventiva);
app.use(autenticacao);

app.listen(3000, () => {
    console.log("Servidor rodando em: http://localhost:3000");
    console.log("Pasta de uploads configurada em:", path.join(__dirname, '../uploads'));
});