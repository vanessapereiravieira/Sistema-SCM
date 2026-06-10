function verificarAdmin(req, res, next) {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado"
        });
    }

    if (req.session.usuario.role !== "admin") {
        return res.status(403).json({
            mensagem: "Acesso negado"
        });
    }

    next();
}

module.exports = verificarAdmin;