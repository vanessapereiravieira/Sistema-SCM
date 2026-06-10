const express = require("express");
const db = require("../config/db.js");

const router = express.Router();

// LOGIN 
router.post("/login", (req, res) => {

    const { email, senha, tipoUsuario } = req.body; 

    db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        (err, resultado) => {

            if (err) {
                console.error("Erro no banco:", err);
                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro interno"
                });
            }

            if (resultado.length === 0) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Credenciais inválidas"
                });
            }

            const usuario = resultado[0];

            // Verificar senha
            if (senha !== usuario.senha) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Credenciais inválidas"
                });
            }

            // Verificar tipo de usuário
            if (tipoUsuario === 'admin' && usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Este usuário não é administrador"
                });
            }

            // Criar sessão
            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                setor: usuario.setor
            };

            // IMPORTANTE: Salvar a sessão explicitamente antes de responder
            req.session.save((err) => {
                if (err) {
                    console.error("Erro ao salvar sessão:", err);
                    return res.status(500).json({
                        sucesso: false,
                        mensagem: "Erro ao criar sessão"
                    });
                }

                console.log("Sessão salva para:", usuario.email);
                console.log("   Session ID:", req.session.id);
                console.log("   Usuário na sessão:", req.session.usuario.email);

                res.json({
                    sucesso: true,
                    usuario: req.session.usuario
                });
            });
        }
    );
});

// VERIFICAR SESSÃO
router.get("/verificar-sessao", (req, res) => {
    console.log("Verificando sessão...");
    console.log("   Session ID:", req.session.id);

    if (req.session.usuario) {
        console.log("   Usuário na sessão:", req.session.usuario.email);
    } else {
        console.log("   Usuário na sessão: Nenhum");
    }

    if (!req.session.usuario) {
        return res.json({
            logado: false
        });
    }

    res.json({
        logado: true,
        usuario: req.session.usuario
    });
});

// LOGOUT 
router.post("/logout", (req, res) => {
    const sessionId = req.session.id;
    
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao destruir sessão:", err);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao fazer logout"
            });
        }
        
        console.log("Sessão destruída:", sessionId);
        res.clearCookie("connect.sid");
        
        res.json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso"
        });
    });
});

module.exports = router;