//delete collection EX: db.postagens.drop()
//model 'Postagem' -> cria uma 'collection' chamada 'postagens'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const novaData = new Date()
var horaF = `Horário: ${novaData.getHours()}:${novaData.getMinutes()}:${novaData.getSeconds()}` 
var dataF = `Data: ${novaData.getDay()}/${novaData.getMonth()}/${novaData.getFullYear()}`

const dataFormat = `${horaF} - ${dataF}`  

const Postagem = new Schema({

    titulo: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    descricao: {
        type: String,
        required: true
    },

    conteudo: {
        type: String,
        required: true
    },

    categoria: {
        type: Schema.Types.ObjectId, // atribui um valor 'id' de outro 'model'
        ref: 'categorias', // define o nome do 'model' utilizado como referencia
        required: true
    },

    data: {
        type: Date,
        default: Date.now   //passando um valor padrão (pode ser aplicado a tds os campos).
    },

    newDate: {
        type: String,
        default: dataFormat
    }


})

//mongoose.model('collection','Schema')
mongoose.model('postagens', Postagem)