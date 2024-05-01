const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentAnswerSchema = new Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'quizzes',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  answers: [{
    name:String,
    isCorrect:Boolean 
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number, // Optional, score or points achieved
  },
});

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);
