const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =================================================================
// CONFIGURAÇÃO PARA UPLOAD DE IMAGENS
// =================================================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../uploads/manutencoes");
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, "manutencao-" + uniqueSuffix + extension);
    }
});

const fileFilter = function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Apenas imagens são permitidas (JPG, PNG, GIF)"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// =================================================================
// 1. CRIAR MANUTENÇÃO PREVENTIVA
// =================================================================
router.post("/nova-manutencao", upload.single("imagem"), (req, res) => {
    const equipamento = req.body.equipamento;
    const responsavel = req.body.responsavel;
    const localTipo = req.body.localTipo;
    const nomeSala = req.body.nomeSala;
    const categoria = req.body.categoria;
    const periodicidade = req.body.periodicidade;
    const dataUltima = req.body.dataUltima;
    const dataProxima = req.body.dataProxima;
    const urgencia = req.body.urgencia || "Média";
    const observacoes = req.body.observacoes;
    const usuario_id = req.body.usuario_id;

    if (!usuario_id) {
        return res.status(400).json({
            mensagem: "Usuário é obrigatório para criar manutenção"
        });
    }

    if (!equipamento || !responsavel || !localTipo || !nomeSala || 
        !categoria || !periodicidade || !dataUltima || !dataProxima) {
        return res.status(400).json({
            mensagem: "Todos os campos obrigatórios devem ser preenchidos"
        });
    }

    let setor_destino = "";
    
    if (categoria === "TI") {
        setor_destino = "TI";
    } else if (categoria === "NEP") {
        setor_destino = "NEP";
    } else {
        return res.status(400).json({ mensagem: "Categoria inválida" });
    }

    let local = "";
    
    if (localTipo === "sala") {
        local = "Sala";
    } else {
        local = "Laboratório";
    }

    let periodicidadeNormalizada = "";
    const periodicidadeLower = periodicidade.toLowerCase();
    
    if (periodicidadeLower === "semanal") {
        periodicidadeNormalizada = "Semanal";
    } else if (periodicidadeLower === "mensal") {
        periodicidadeNormalizada = "Mensal";
    } else if (periodicidadeLower === "trimestral") {
        periodicidadeNormalizada = "Trimestral";
    } else if (periodicidadeLower === "semestral") {
        periodicidadeNormalizada = "Semestral";
    } else if (periodicidadeLower === "anual") {
        periodicidadeNormalizada = "Anual";
    } else {
        periodicidadeNormalizada = periodicidade;
    }

    let urgenciaNormalizada = "";
    const urgenciaLower = urgencia.toLowerCase();
    
    if (urgenciaLower === "baixa") {
        urgenciaNormalizada = "Baixa";
    } else if (urgenciaLower === "media" || urgenciaLower === "média") {
        urgenciaNormalizada = "Média";
    } else if (urgenciaLower === "alta") {
        urgenciaNormalizada = "Alta";
    } else {
        urgenciaNormalizada = "Média";
    }

    let imagemPath = null;
    
    if (req.file) {
        // Salva apenas o caminho relativo para acesso via URL
        imagemPath = `/uploads/manutencoes/${req.file.filename}`;
        console.log(`Imagem salva com caminho relativo: ${imagemPath}`);
    }

    const statusNormalizado = "Aberto";

    const sql = `
        INSERT INTO manutencoes_preventivas
        (equipamento, responsavel, local, nome_sala, categoria, periodicidade, 
         data_ultima, data_proxima, status, urgencia, observacoes, imagem, usuario_id, setor_destino)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let observacoesFinal = null;
    if (observacoes) {
        observacoesFinal = observacoes;
    }

    const valores = [
        equipamento,
        responsavel,
        local,
        nomeSala,
        categoria,
        periodicidadeNormalizada,
        dataUltima,
        dataProxima,
        statusNormalizado,
        urgenciaNormalizada,
        observacoesFinal,
        imagemPath,
        usuario_id,
        setor_destino
    ];

    db.query(sql, valores, function(erro, resultado) {
        if (erro) {
            console.error("Erro ao criar manutenção preventiva:", erro);
            return res.status(500).json({
                mensagem: "Erro ao criar manutenção preventiva"
            });
        }
        
        res.status(201).json({ 
            mensagem: "Manutenção preventiva criada com sucesso",
            id: resultado.insertId
        });
    });
});

// =================================================================
// 2. MINHAS MANUTENÇÕES PREVENTIVAS (COM VERIFICAÇÃO ADMIN)
// =================================================================
router.get("/minhas-manutencoes", function(req, res) {
    const usuario_id = req.query.usuario_id;
    const role = req.query.role;

    if (!usuario_id) {
        return res.status(400).json({ mensagem: "Usuário ID é obrigatório" });
    }

    let sql = "";
    let params = [];

    if (role === 'admin') {
        // Admin vê todas as manutenções de todos os usuários
        sql = `
            SELECT 
                m.*, 
                u.nome AS criador_nome, 
                u.setor AS criador_setor,
                m.created_at AS criado_em
            FROM manutencoes_preventivas m
            JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY 
                CASE m.urgencia
                    WHEN 'Alta' THEN 1
                    WHEN 'Média' THEN 2
                    WHEN 'Baixa' THEN 3
                    ELSE 4
                END,
                m.created_at DESC
        `;
        params = [];
    } else {
        // Usuário comum vê apenas suas próprias manutenções
        sql = `
            SELECT 
                m.*, 
                u.nome AS criador_nome, 
                u.setor AS criador_setor,
                m.created_at AS criado_em
            FROM manutencoes_preventivas m
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.usuario_id = ?
            ORDER BY 
                CASE m.urgencia
                    WHEN 'Alta' THEN 1
                    WHEN 'Média' THEN 2
                    WHEN 'Baixa' THEN 3
                    ELSE 4
                END,
                m.created_at DESC
        `;
        params = [usuario_id];
    }

    db.query(sql, params, function(erro, resultado) {
        if (erro) {
            console.error("Erro ao buscar manutenções:", erro);
            return res.status(500).json({ mensagem: "Erro ao buscar manutenções" });
        }
        
        res.json(resultado);
    });
});

// =================================================================
// 3. MANUTENÇÕES ENCAMINHADAS
// =================================================================
router.get("/manutencoes-encaminhadas", function(req, res) {
    const usuario_id = req.query.usuario_id;
    const role = req.query.role;
    const setor = req.query.setor;

    if (!usuario_id) {
        return res.status(400).json({ mensagem: "Usuário ID é obrigatório" });
    }

    let sql = "";
    let params = [];

    if (role === 'admin') {
        sql = `
            SELECT 
                m.*, 
                u.nome AS criador_nome, 
                u.setor AS criador_setor,
                m.created_at AS criado_em
            FROM manutencoes_preventivas m
            JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY 
                CASE m.urgencia
                    WHEN 'Alta' THEN 1
                    WHEN 'Média' THEN 2
                    WHEN 'Baixa' THEN 3
                    ELSE 4
                END,
                m.created_at DESC
        `;
        params = [];
    } else {
        sql = `
            SELECT 
                m.*, 
                u.nome AS criador_nome, 
                u.setor AS criador_setor,
                m.created_at AS criado_em
            FROM manutencoes_preventivas m
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.setor_destino = ?
            ORDER BY 
                CASE m.urgencia
                    WHEN 'Alta' THEN 1
                    WHEN 'Média' THEN 2
                    WHEN 'Baixa' THEN 3
                    ELSE 4
                END,
                m.created_at DESC
        `;
        params = [setor];
    }

    db.query(sql, params, function(erro, resultado) {
        if (erro) {
            console.error("Erro ao buscar manutenções encaminhadas:", erro);
            return res.status(500).json({ mensagem: "Erro ao buscar manutenções" });
        }
        res.json(resultado);
    });
});

// =================================================================
// 4. EDITAR MANUTENÇÃO PREVENTIVA (CORRIGIDO - SEM OPERADOR TERNÁRIO)
// =================================================================
router.put("/nova-manutencao/:id", upload.single("imagem"), function(req, res) {
    const id = req.params.id;
    
    // Primeiro, busca a manutenção atual
    const sqlBuscarAtual = `
        SELECT * FROM manutencoes_preventivas
        WHERE id = ? AND usuario_id = ?
    `;
    
    db.query(sqlBuscarAtual, [id, req.body.usuario_id], function(erro, resultado) {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                mensagem: "Erro ao buscar manutenção atual"
            });
        }
        
        if (resultado.length === 0) {
            return res.status(403).json({
                mensagem: "Manutenção não encontrada ou você não tem permissão"
            });
        }
        
        const manutencaoAtual = resultado[0];
        
        let equipamentoFinal;
        if (req.body.equipamento && req.body.equipamento.trim() !== "") {
            equipamentoFinal = req.body.equipamento;
        } else {
            equipamentoFinal = manutencaoAtual.equipamento;
        }
        
        let responsavelFinal;
        if (req.body.responsavel && req.body.responsavel.trim() !== "") {
            responsavelFinal = req.body.responsavel;
        } else {
            responsavelFinal = manutencaoAtual.responsavel;
        }
        
        let nomeSalaFinal;
        if (req.body.nomeSala && req.body.nomeSala.trim() !== "") {
            nomeSalaFinal = req.body.nomeSala;
        } else {
            nomeSalaFinal = manutencaoAtual.nome_sala;
        }
        
        let categoriaFinal;
        if (req.body.categoria && req.body.categoria.trim() !== "") {
            categoriaFinal = req.body.categoria;
        } else {
            categoriaFinal = manutencaoAtual.categoria;
        }
        
        let periodicidadeFinal;
        if (req.body.periodicidade && req.body.periodicidade.trim() !== "") {
            periodicidadeFinal = req.body.periodicidade;
        } else {
            periodicidadeFinal = manutencaoAtual.periodicidade;
        }
        
        let dataUltimaFinal;
        if (req.body.dataUltima && req.body.dataUltima.trim() !== "") {
            dataUltimaFinal = req.body.dataUltima;
        } else {
            dataUltimaFinal = manutencaoAtual.data_ultima;
        }
        
        let dataProximaFinal;
        if (req.body.dataProxima && req.body.dataProxima.trim() !== "") {
            dataProximaFinal = req.body.dataProxima;
        } else {
            dataProximaFinal = manutencaoAtual.data_proxima;
        }
        
        let urgenciaFinal;
        if (req.body.urgencia && req.body.urgencia.trim() !== "") {
            urgenciaFinal = req.body.urgencia;
        } else {
            urgenciaFinal = manutencaoAtual.urgencia;
        }
        
        let observacoesFinal;
        if (req.body.observacoes && req.body.observacoes.trim() !== "") {
            observacoesFinal = req.body.observacoes;
        } else {
            observacoesFinal = manutencaoAtual.observacoes;
        }
        
        // Para status
        let statusNormalizado;
        if (req.body.status && req.body.status.trim() !== "") {
            const statusLower = req.body.status.toLowerCase();
            
            if (statusLower === "pendente") {
                statusNormalizado = "Pendente";
            } else if (statusLower === "andamento" || statusLower === "em andamento") {
                statusNormalizado = "Em andamento";
            } else if (statusLower === "concluido" || statusLower === "concluído") {
                statusNormalizado = "Concluído";
            } else if (statusLower === "cancelado") {
                statusNormalizado = "Cancelado";
            } else if (statusLower === "aberto") {
                statusNormalizado = "Aberto";
            } else {
                statusNormalizado = req.body.status;
            }
        } else {
            statusNormalizado = manutencaoAtual.status;
        }
        
        // Determinar local
        let local;
        const localTipo = req.body.localTipo;
        
        if (localTipo === "sala") {
            local = "Sala";
        } else if (localTipo === "laboratorio") {
            local = "Laboratório";
        } else {
            local = manutencaoAtual.local;
        }
        
        // Determinar setor destino
        let setor_destino;
        if (categoriaFinal === "TI") {
            setor_destino = "TI";
        } else if (categoriaFinal === "NEP") {
            setor_destino = "NEP";
        } else {
            setor_destino = manutencaoAtual.setor_destino;
        }
        
        // Tratamento da imagem
        let imagemPath = manutencaoAtual.imagem;
        
        if (req.file) {
            // Remove imagem antiga se existir
            if (imagemPath) {
                const oldImagePath = path.join(__dirname, "..", imagemPath);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`Imagem antiga removida: ${oldImagePath}`);
                }
            }
            // Salva novo caminho relativo
            imagemPath = `/uploads/manutencoes/${req.file.filename}`;
            console.log(`Nova imagem salva com caminho relativo: ${imagemPath}`);
        }
        
        // SQL UPDATE com todos os campos
        const sqlUpdate = `
            UPDATE manutencoes_preventivas
            SET
                equipamento = ?,
                responsavel = ?,
                local = ?,
                nome_sala = ?,
                categoria = ?,
                periodicidade = ?,
                data_ultima = ?,
                data_proxima = ?,
                status = ?,
                urgencia = ?,
                observacoes = ?,
                imagem = ?,
                setor_destino = ?
            WHERE id = ? AND usuario_id = ?
        `;
        
        const valores = [
            equipamentoFinal,
            responsavelFinal,
            local,
            nomeSalaFinal,
            categoriaFinal,
            periodicidadeFinal,
            dataUltimaFinal,
            dataProximaFinal,
            statusNormalizado,
            urgenciaFinal,
            observacoesFinal,
            imagemPath,
            setor_destino,
            id,
            req.body.usuario_id
        ];
        
        db.query(sqlUpdate, valores, function(erro, resultadoUpdate) {
            if (erro) {
                console.error("Erro SQL:", erro);
                return res.status(500).json({
                    mensagem: "Erro ao editar manutenção: " + erro.message
                });
            }
            
            if (resultadoUpdate.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Manutenção não encontrada"
                });
            }
            
            res.json({
                mensagem: "Manutenção editada com sucesso"
            });
        });
    });
});

// =================================================================
// 5. EXCLUIR MANUTENÇÃO PREVENTIVA (ADMIN PODE EXCLUIR QUALQUER)
// =================================================================
router.delete("/nova-manutencao/:id", function(req, res) {
    const id = req.params.id;
    const usuario_id = req.body.usuario_id;
    const role = req.body.role;

    if (!usuario_id) {
        return res.status(400).json({
            mensagem: "Usuário é obrigatório"
        });
    }

    let sqlBusca = "";
    let paramsBusca = [];

    if (role === 'admin') {
        // Admin pode buscar qualquer manutenção
        sqlBusca = `SELECT id, imagem FROM manutencoes_preventivas WHERE id = ?`;
        paramsBusca = [id];
    } else {
        // Usuário comum só busca suas próprias manutenções
        sqlBusca = `SELECT id, imagem FROM manutencoes_preventivas WHERE id = ? AND usuario_id = ?`;
        paramsBusca = [id, usuario_id];
    }

    db.query(sqlBusca, paramsBusca, function(erro, resultado) {
        if (erro) {
            console.error("Erro ao buscar manutenção:", erro);
            return res.status(500).json({
                mensagem: "Erro ao buscar manutenção"
            });
        }

        if (resultado.length === 0) {
            return res.status(403).json({
                mensagem: "Manutenção não encontrada ou você não tem permissão"
            });
        }

        const imagemPath = resultado[0].imagem;

        let sqlDelete = "";
        let paramsDelete = [];

        if (role === 'admin') {
            // Admin pode excluir qualquer manutenção
            sqlDelete = `DELETE FROM manutencoes_preventivas WHERE id = ?`;
            paramsDelete = [id];
        } else {
            // Usuário comum só exclui suas próprias
            sqlDelete = `DELETE FROM manutencoes_preventivas WHERE id = ? AND usuario_id = ?`;
            paramsDelete = [id, usuario_id];
        }

        db.query(sqlDelete, paramsDelete, function(erro, resultadoDelete) {
            if (erro) {
                console.error("Erro ao excluir manutenção:", erro);
                return res.status(500).json({
                    mensagem: "Erro ao excluir manutenção"
                });
            }

            if (resultadoDelete.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Manutenção não encontrada"
                });
            }

            // Remover imagem se existir
            if (imagemPath) {
                try {
                    // Converte caminho relativo para absoluto para deletar o arquivo
                    const fullPath = path.join(__dirname, "..", imagemPath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log(`Imagem removida com sucesso: ${fullPath}`);
                    } else {
                        console.log(`Imagem não encontrada: ${fullPath}`);
                    }
                } catch (erroArquivo) {
                    console.error("Erro ao remover arquivo da imagem:", erroArquivo);
                }
            }

            res.json({
                mensagem: "Manutenção excluída com sucesso"
            });
        });
    });
});

// =================================================================
// 6. ALTERAR STATUS (Só admin)
// =================================================================
router.patch("/nova-manutencao/:id/status", function(req, res) {
    const id = req.params.id;
    const status = req.body.status;
    const role = req.body.role;

    if (role !== 'admin') {
        return res.status(403).json({ mensagem: "Acesso negado. Apenas admin pode alterar status" });
    }

    if (!status) {
        return res.status(400).json({ mensagem: "Informe o status" });
    }

    let statusNormalizado = "";
    const statusLower = status.toLowerCase();
    
    if (statusLower === "pendente") {
        statusNormalizado = "Pendente";
    } else if (statusLower === "andamento" || statusLower === "em andamento") {
        statusNormalizado = "Em andamento";
    } else if (statusLower === "concluido" || statusLower === "concluído") {
        statusNormalizado = "Concluído";
    } else if (statusLower === "cancelado") {
        statusNormalizado = "Cancelado";
    } else if (statusLower === "aberto") {
        statusNormalizado = "Aberto";
    } else {
        statusNormalizado = status;
    }

    const sql = `UPDATE manutencoes_preventivas SET status = ? WHERE id = ?`;

    db.query(sql, [statusNormalizado, id], function(erro, resultado) {
        if (erro) {
            return res.status(500).json({ mensagem: "Erro ao atualizar status" });
        }
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Manutenção não encontrada" });
        }
        
        res.json({ mensagem: "Status atualizado com sucesso" });
    });
});

module.exports = router;