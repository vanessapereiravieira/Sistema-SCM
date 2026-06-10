function verificarUsuario(req, res, next) {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário Não autenticado"
        });
    }

    next();
}

module.exports = verificarUsuario;