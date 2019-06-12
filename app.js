//iniciando os modulos...
const express     = require('express')
const handlebars  = require('express-handlebars')
const bodyParser  = require('body-parser')
const app         = express()
const admin       = require('./routes/admin')   //path do arquivo onde estao as rotas do 'admin' a serem importadas
const usuario     = require('./routes/usuario') //path do arquivo onde estao as rotas do 'usuario' a serem importadas
const path        = require('path') //manipula pastas  
const mongoose    = require('mongoose')
const session     = require('express-session')
const flash       = require('connect-flash')
require('./models/Postagem')  
const Postagem    = mongoose.model('postagens')
require('./models/Categoria')
const Categoria   = mongoose.model('categorias')
const passport    = require('passport')
require('./config/auth')(passport)
const connDB = require('./config/db')


//configurações(app.use = configuração de middleware):
//----------------------
//sessão
app.use(session ({
    secret: 'sessionSecret',
    resave: true,
    saveUninitialized: true
}))
//autenticação(passport):
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//  middleware (tratamento de erros do formulario)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg') // 'locals' define uma varivel global
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null // variavel armazena os dados do usuario logado no sistema
    next()
})

//-----------------body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//  handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//iniciando servidor mongo...
mongoose.Promise = global.Promise
mongoose.connect(connDB.mongoURI).then(() => {
    console.log('>>> O servidor MongoDB está em execução...')
}).catch((err) => {
    console.log(`Erro ao tentar efetuar a conexão com bando de dados: ${err}`)
})

//(public) Importa arquivos estaticos (css-js...)
app.use(express.static(path.join(__dirname,'public')))

//pagina inicial (sem Rota)
app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('index', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', '' + err)
    })
    
})

//exibe a postagem selecionada:
app.get('/leiamais/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).populate('categoria').then((postagens) => {
        res.render('exibePostagens/readmore', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao exibir a postagem:' + err)
        res.redirect('/')
    })
})

//exibe tds as categorias:
app.get('/exibe-categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('exibeCategorias/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar as categorias.' + err)
        res.redirect('/')
    })
})

//exibe tds as postagens:
app.get('/exibe-postagens', (req, res) => {
    Postagem.find().then((postagens) => {
        res.render('exibePostagens/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar as postagens.' + err)
        res.redirect('/')
    })
})

//exibe postagens pelo 'slug' das categorias:
app.get('/categoriasBySlug/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if (categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render('exibeCategorias/postagens', {categoria: categoria, postagens: postagens})
            }).catch((err) => {
                req.flash('error_msg', 'Ocorreu um erro ao tentar listar as postagens.' + err)
                res.redirect('/')
            })
        }else {
            req.flash('error_msg', 'Categoria Inexistente.')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg',''+ err)
        res.redirect('/')
    })
})



//importando Rota 'admin' ('/admin' é o prefixo para as rotas. EX: http://localhost/admin/posts)
app.use('/admin', admin)
app.use('/usuario', usuario)


//servidor express...
const PORT = process.env.PORT || 8089

app.listen(PORT,() => {
    console.log(`Servidor conectado na porta: ${PORT}...\n`)
})

