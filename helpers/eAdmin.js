//verifica se o usuario estiver logado e se é o Admin do sistema

module.exports = {
    eAdmin: ((req, res, next) => {
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }
        req.flash('error_msg', 'Reservado para o Administrador do sistema.')
        res.redirect('/')
    })
}