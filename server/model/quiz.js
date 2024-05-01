
const mongoose = require('mongoose')

const quizschema = mongoose.Schema({
    title: String,
    questions: [{
        question: String,
        options: [{
            name: String,
            isCorrect: Boolean
        }]
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    published:Boolean,
    code: String
})

module.exports = mongoose.model('Quiz', quizschema)
