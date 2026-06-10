const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =================================================================
// 1. CRIAR CHAMADO
// =================================================================
router.post("/novo-chamado", (req, res) => {
    const {
        nomeChamado,
        categoria,
        descricao,
        tipoLocal,
        nome_sala,
        urgencia,
        usuario_id
    } = req.body;

    if (!usuario_id) {
        return res.status(400).json({
            mensagem: "Usuario é obrigatorio para criar chamado"
        });
    }

    let setor_destino = "";
    if (categoria === "TI") {
        setor_destino = "TI";
    } else if (categoria === "NEP") {
        setor_destino = "NEP";
    } else {
        return res.status(400).json({ mensagem: "Categoria invalida" });
    }

    let local;
    if (tipoLocal === "sala") {
        local = "Sala";
    } else {
        local = "Laboratorio";
    }

    let urgenciaNormalizada = "";
    if (urgencia === "Baixa" || urgencia === "baixa") {
        urgenciaNormalizada = "Baixa";
    } else if (urgencia === "Media" || urgencia === "media") {
        urgenciaNormalizada = "Média";
    } else if (urgencia === "Alta" || urgencia === "alta") {
        urgenciaNormalizada = "Alta";
    } else {
        urgenciaNormalizada = urgencia;
    }

    const sql = `
        INSERT INTO chamados
        (nome, categoria, descricao, local, nome_sala, urgencia, usuario_id, setor_destino, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nomeChamado,
        categoria,
        descricao,
        local,
        nome_sala,
        urgenciaNormalizada,
        usuario_id,
        setor_destino,
        "Aberto"
    ];

    db.query(sql, valores, (erro) => {
        if (erro) {
            console.error("Erro ao criar chamado:", erro);
            return res.status(500).json({
                mensagem: "Erro ao criar chamado"
            });
        }
        res.status(201).json({ mensagem: "Chamado criado com sucesso" });
    });
});

// =================================================================
// 2. MEUS CHAMADOS (só os que o usuário criou)
// =================================================================
router.get("/meus-chamados", (req, res) => {
    const { usuario_id } = req.query;

    if (!usuario_id) {
        return res.status(400).json({ mensagem: "Usuario ID é obrigatorio" });
    }

    const sql = `
        SELECT * FROM chamados
        WHERE usuario_id = ?
        ORDER BY criado_em DESC
    `;

    db.query(sql, [usuario_id], (erro, resultado) => {
        if (erro) {
            return res.status(500).json({ mensagem: "Erro ao buscar chamados" });
        }
        res.json(resultado);
    });
});

// =================================================================
// 3. CHAMADOS ENVIADOS (para um determinado setor)
//    - Admin: vê todos
//    - User: vê só os do seu setor
// =================================================================
router.get("/chamados-encaminhados", (req, res) => {
    const { usuario_id, role, setor } = req.query;

    if (!usuario_id) {
        return res.status(400).json({ mensagem: "Usuario ID é obrigatorio" });
    }

    let sql = "";
    let params = [];

    if (role === 'admin') {
        // Admin vê TODOS os chamados encaminhados
        sql = `
            SELECT c.*, u.nome AS criador_nome, u.setor AS criador_setor
            FROM chamados c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.criado_em DESC
        `;
        params = [];
    } else {
        // User comum vê só os chamados do seu setor
        sql = `
            SELECT c.*, u.nome AS criador_nome, u.setor AS criador_setor
            FROM chamados c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.setor_destino = ?
            ORDER BY c.criado_em DESC
        `;
        params = [setor];
    }

    db.query(sql, params, (erro, resultado) => {
        if (erro) {
            console.error("Erro ao buscar chamados encaminhados:", erro);
            return res.status(500).json({ mensagem: "Erro ao buscar chamados" });
        }
        res.json(resultado);
    });
});

// =================================================================
// 4. EDITAR CHAMADO
// =================================================================
router.put("/novo-chamado/:id", (req, res) => {
    const id = req.params.id;

    const {
        nomeChamado,
        categoria,
        descricao,
        tipoLocal,
        nome_sala,
        urgencia,
        usuario_id
    } = req.body;

    // Verifica categoria e define setor destino
    let setor_destino = "";

    if (categoria === "TI") {
        setor_destino = "TI";
    } else if (categoria === "NEP") {
        setor_destino = "NEP";
    } else {
        return res.status(400).json({
            mensagem: "Categoria inválida"
        });
    }

    // Substituído operador ternário
    let local;
    if (tipoLocal === "sala") {
        local = "Sala";
    } else {
        local = "Laboratorio";
    }

    // Padroniza urgência
    let urgenciaNormalizada = "";

    if (urgencia === "Baixa" || urgencia === "baixa") {
        urgenciaNormalizada = "Baixa";
    } else if (urgencia === "Media" || urgencia === "media" || urgencia === "Média") {
        urgenciaNormalizada = "Média";
    } else if (urgencia === "Alta" || urgencia === "alta") {
        urgenciaNormalizada = "Alta";
    } else {
        urgenciaNormalizada = urgencia;
    }

    const sqlVerifica = `
        SELECT id
        FROM chamados
        WHERE id = ? AND usuario_id = ?
    `;

    db.query(sqlVerifica, [id, usuario_id], (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                mensagem: "Erro ao verificar chamado"
            });
        }

        if (resultado.length === 0) {
            return res.status(403).json({
                mensagem: "Você só pode editar seus próprios chamados"
            });
        }

        const sqlUpdate = `
            UPDATE chamados
            SET
                nome = ?,
                categoria = ?,
                descricao = ?,
                local = ?,
                nome_sala = ?,
                urgencia = ?,
                setor_destino = ?
            WHERE id = ?
        `;

        db.query(
            sqlUpdate,
            [
                nomeChamado,
                categoria,
                descricao,
                local,
                nome_sala,
                urgenciaNormalizada,
                setor_destino,
                id
            ],
            (erro, resultado) => {
                if (erro) {
                    console.error("Erro SQL:", erro);

                    return res.status(500).json({
                        mensagem: "Erro ao editar chamado"
                    });
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        mensagem: "Chamado não encontrado"
                    });
                }

                res.json({
                    mensagem: "Chamado editado com sucesso"
                });
            }
        );
    });
});

// =================================================================
// 5. EXCLUIR CHAMADO
// =================================================================
router.delete("/novo-chamado/:id", (req, res) => {
    const id = req.params.id;
    const { usuario_id } = req.body;

    const sql = `
        DELETE FROM chamados
        WHERE id = ? AND usuario_id = ?
    `;

    db.query(sql, [id, usuario_id], (erro, resultado) => {
        if (erro) {
            return res.status(500).json({ mensagem: "Erro ao excluir chamado" });
        }

        if (resultado.affectedRows === 0) {
            return res.status(403).json({
                mensagem: "Você só pode excluir seus próprios chamados"
            });
        }

        res.json({ mensagem: "Chamado excluído com sucesso" });
    });
});

// =================================================================
// 6. ALTERAR STATUS (Só admin)
// =================================================================
router.patch("/novo-chamado/:id/status", (req, res) => {
    const id = req.params.id;
    const { status, role } = req.body;

    if (role !== 'admin') {
        return res.status(403).json({ mensagem: "Acesso negado. Apenas admin pode alterar status" });
    }

    if (!status) {
        return res.status(400).json({ mensagem: "Informe o status" });
    }

    let statusNormalizado = "";
    const statusLower = status.toLowerCase();
    
    if (statusLower === "aberto") {
        statusNormalizado = "Aberto";
    } else if (statusLower === "em andamento") {
        statusNormalizado = "Em andamento";
    } else if (statusLower === "concluido" || statusLower === "concluído") {
        statusNormalizado = "Concluído";
    } else if (statusLower === "cancelado") {
        statusNormalizado = "Cancelado";
    } else {
        statusNormalizado = status;
    }

    const sql = `UPDATE chamados SET status = ? WHERE id = ?`;

    db.query(sql, [statusNormalizado, id], (erro, resultado) => {
        if (erro) {
            return res.status(500).json({ mensagem: "Erro ao atualizar status" });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Chamado nao encontrado" });
        }
        res.json({ mensagem: "Status atualizado com sucesso" });
    });
});

module.exports = router;