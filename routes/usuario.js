//rotas para 'usuario'
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcrypt')
const passport = require('passport')


router.get('/', (req, res) => {
    res.render('usuario/template/inicialUsuario')
})

router.get('/cadastro', (req, res) => {
    res.render('usuario/cadastro')
})

router.get('/login', (req, res) => {
    res.render('usuario/login')
})

//login do usuario:
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req, res, next)

})

//logout do usuario:
router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'Logout efetuado com sucesso!')
    res.redirect('/')
})



//cadastro de usuario:
router.post('/cadastro/sucesso', (req, res) => {   
    //validando form:
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Preencha correntamente o campo 'Nome'."})
    }
    if(!req.body.sobrenome || typeof req.body.sobrenome == undefined || req.body.sobrenome == null) {
        erros.push({texto: "Preencha correntamente o campo 'Sobrenome'."})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Preencha correntamente o campo 'email'."})
    }
    if (req.body.senha != req.body.testSenha) {
        erros.push({texto: "ERRO! As senhas são Incompatíveis. Tente novamente..."})
    }
    
    if (erros.length > 0) {
        res.render('usuario/cadastro', {erros: erros})
    }
    else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if (usuario){
                req.flash('error_msg', 'ERRO! O e-mail informado já foi cadastrado no sistema. Tente novamente...')
                res.redirect('/usuario/cadastro')
            }else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    sobrenome: req.body.sobrenome,
                    email: req.body.email,
                    senha: req.body.senha    
                    //eAdmin: 1                
                })

                //gerando um hash da senha do usuario:
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Ocorreu um erro ao tentar cadastrar novo usuário')
                            res.redirect('/')
                        }

                        //cadastrando usuario...
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', `Ocorreu um erro ao tentar cadastrar novo usuário. ${err}`)
                            res.redirect('/')
                        })
                    })

                })       
                
            }

        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro interno. ${err}`)
            res.redirect('/')
        })
    }

})
//fim cadastro do usuario



module.exports = router