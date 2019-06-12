//arquivo de configuração de autentificação.

const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//importar 'model' do usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = ((passport) => {
    //'passwordField' utilizado quando o nome do campo nao for reconhecido
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: 'E-Mail ou Senha incorretos.'})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    return done(null, usuario)
                }else {
                    return done(null, false, {message: 'E-Mail ou Senha incorretos.'})
                }
            })
        })

    }))


    //salva o dados do usuario em um sessão
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    //procura um usuario pelo 'id'
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })


})