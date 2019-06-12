//Cadastro de categorias -- arquivos 'models' sempre com letra inicial maiuscula e no singular
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        default: Date.now //passando um valor padrão (pode ser aplicado a tds os campos).
    }

})

mongoose.model('categorias', Categoria)

