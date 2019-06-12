//  rotas para 'admin'
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria') // importando 'categorias'
const Categoria = mongoose.model('categorias')
require('../models/Postagem')// importando 'postagens'
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin') //proteje as rotas que serão acessadas apenas pelos Admin do sistema


//  definindo rotas....
router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/posts', eAdmin, (req, res) => {
    res.send('<h1>Página de postagens</h1>')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({data: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})  //arquivo dentro do diretório 'views/admin'
    }).catch(() => {
        req.flash('error_msg', 'Ocorreu um erro ao tentar listar os registros.')
        res.redirect('/admin')
    })
    
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')  //arquivo dentro do diretório 'views/admin'
})

//cadastrando categoria
router.post('/categorias/nova', eAdmin, (req, res) => {
    
    //validação de formulário
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido!'}) // push() serve para colocar um novo dado dentro de uma array    
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido!'})
    }
    //se houver erros...
    if (erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        //criando nova categoria
        new Categoria(novaCategoria).save().then(() => {
            //console.log('Categoria salva com sucesso!')
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao tentar salvar o registro, tente novamente!')
            res.redirect('/admin')
        })
    }

})

//rota para edição de registros por 'id':
router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', `Categoria inexistente! ${err}`)
        res.redirect('/admin/categorias')
    })
    
})
router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria alterada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro ao tentar salvar a categoria. ${err}`)   
            res.redirect('/admin/categorias')             
        })

    }).catch((err) =>{
        req.flash('error_msg', `ERRO! Não foi possivel editar a categoria. ${err}`)
        res.redirect('/admin/categorias')
    })
})

//deletar registro(categoria)
router.post('/categorias/deletar/:id', eAdmin, (req, res) => {
    Categoria.deleteOne({'_id':req.params.id}).then(() => {
        req.flash('success_msg', `Categoria excluida com sucesso!`)
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao tentar excluir a categoria. ${err}`)
        res.redirect('/admin/categorias')
    })
})


//---------ROTAS PARA 'postagens'---------

//listar postagens:
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => { // '.populate()' 
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao tentar listar as postagens. ' + err)
        res.redirect('/admin')
    })
})

//rota para a pagina de adicionar postagem
router.get('/postagens/add', eAdmin, (req, res) => {    
    Categoria.find().then((categorias) =>{
        res.render('admin/addpostagens.handlebars', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao carregar o formulário: ${err}`)
        res.redirect('/admin')
    })
     
})

//cadastrar postagem:
router.post('/postagens/nova', eAdmin, (req, res) => {
    
    var erros = []
    
    if (req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida!'})
    }

    if (erros.length > 0){
        res.render('admin/addpostagens', {erros: erros})
    } else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) =>{
            req.flash('error_msg', 'Ocorreu um erro ao tentar criar nova postagem:' + err)
            res.redirect('/admin/postagens')
        })
    }
})

//editar postagem:
router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    //efetuando duas pesquisas no bando de dados por postagens e categorias    
    Postagem.findOne({_id:req.params.id}).then((postagens) => {   //Apenas quando o parametro for '_id' será necessario o 'underscore'.
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro ao tentar listar as categorias: ${err}`)
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg','Erro ao carregar formulário de edição.' + err)
        res.redirect('/admin/postagens')
    })
})


router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagens) => {  // '_id:'  é indispensavel.
        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.conteudo = req.body.conteudo
        postagens.descricao = req.body.descricao
        postagens.categoria = req.body.categoria

        postagens.save().then(() => {
            req.flash('success_msg', 'Postagem salva com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg','Ocorreu um erro ao tentar salvar a Postagem: ' + err)
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Não foi possivel editar o Post ' + err)
        res.redirect('/admin/postagens')
    })
})

//Deletar postagem:

router.post('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({"_id":req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao tentar deletar a Postagem:' + err)
        res.redirect('/admin/postagens')
    })
})




//  exporta as rotas/router
module.exports = router