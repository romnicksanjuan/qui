const express = require('express')
const mongoose = require('mongoose')
const crypto = require('crypto');
const Quiz = require('./model/quiz')
const User = require('./model/user')
const studentAnswer = require('./model/studentAnswer')
const jwt = require('jsonwebtoken')

const app = express()
const secretKey = 'nick14'
mongoose.connect('mongodb+srv://romnick:1234@romnickdb.e14diyv.mongodb.net/quiz-app')
    .then(() => console.log('connected to database'))

app.use(express.json())

// user Register
app.post('/register', async (req, res) => {
    const { username, password } = req.body


    console.log(username.trim())
    const trimUsername = username.trim()
    const trimPassword = password.trim()

    try {

        const check = await User.findOne({ username })

        if (check) {
            return res.json({ messageError: 'Username Already Exist!' })
        }
        const save = new User({ username:trimUsername, password:trimPassword })
        await save.save();
        res.json({ message: 'Registered Successfully', save: save })
    } catch (error) {
        console.log(error)
    }
})

// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username })

        if (user) {
            if (user.password !== password) {
                res.json({ error: 'Username or Password Incorrect' })
            } else {

                const token = jwt.sign({
                    userId: user._id,
                    name: user.name,
                    username: user.username,
                    // profileImage:user.profileImage
                }, secretKey,);

                res.status(200).json({ message: 'Login Successfully', token })
            }
        } else {
            res.json({ error: 'Username or Password Incorrect' })
        }
    } catch (error) {
        console.log(error)
    }
})

// check token from login page



const verifyToken = (req, res, next) => {

    try {
        const headers = req.headers['authorization'];

        if (!headers) {
            return res.json({ err: 'no token provided' })
        }
        const token = headers.split(' ')[1]
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.json({ err: 'token expired' })
            }
            req.userId = decoded.userId
        })
        next()
    } catch (error) {
        console.log(error)
    }
}

// Quiz Title
app.post('/create/:userId', async (req, res) => {
    const id = req.params.userId
    // const id = '662e27d6aaf2e22f2336aab6'
    // console.log(id)
    const { title } = req.body
    try {
        const save = new Quiz({ title: title, author: id })
        await save.save();
        res.json(save)
        console.log(save)
    } catch (error) {
        console.log(error)
    }
});

// title
app.get('/create-quiz-title', verifyToken, async (req, res) => {

    const userId = req.userId
    try {
        return res.json({ userId: userId })
    } catch (error) {

    }
})

// dashboard sdsds
app.get('/', verifyToken, async (req, res) => {

    const author = req.userId
    try {
        const quiz = await Quiz.find({ author: author })

        console.log(quiz)
        res.json({ author: author, quiz })
    } catch (error) {

    }
})

// display quiz title
app.get('/quiz/:quizId', async (req, res) => {
    const quizId = req.params.quizId
    try {
        const quiz = await Quiz.findById({ _id: quizId })

        if (!quiz) {
            res.status(404).json({ errors });
            // stop further execution in this callback
            return;
        }

        const stud = await studentAnswer.find({ quizId }).populate('userId').exec();

        console.log(stud.length)
        return res.json({ quiz: quiz, stud: stud })
    } catch (error) {
        console.log(error)
    }
})


// get quiz by id
app.get('/getQuiz/:quizId', async (req, res) => {
    const { quizId } = req.params
    try {
        const quiz = await Quiz.findById({ _id: quizId })
        console.log(quiz)
        res.json(quiz)
    } catch (error) {
        console.log(error)
    }
})



// add questions
app.post('/create-quiz/:userId/:quizId', async (req, res) => {
    const userId = req.params.userId

    const quizId = req.params.quizId
    // console.log(userId)
    try {
        const question = req.body.question;
        console.log(question)
        const { options } = req.body

        const questionSave = await Quiz.findByIdAndUpdate({ _id: quizId, }, { $push: { questions: { question, options } } },
            { new: true })

        if (!questionSave) {
            res.status(404).json({ errors });
            // stop further execution in this callback
            return;
        }
        return res.status(201).json(questionSave);

        console.log(titleSave)
        console.log('success')
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
});


// delete question
app.post('/quizzes/:quizId/questions/:questionId', async (req, res) => {
    const { quizId, questionId } = req.params;
  
    try {
      // Find the quiz and remove the specific question
      const updatedQuiz = await Quiz.findByIdAndUpdate(
        quizId,
        { $pull: { questions: { _id:questionId } } },
        { new: true }
      );
  
      if (!updatedQuiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      res.json({ message: 'Question deleted', updatedQuiz });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


app.delete('/create-quiz/:myId/:opId', async (req, res) => {
    const _id = req.params.myId
    const opId = req.params.opId

    const obj = '662919565fb0711345723fba'
    console.log(_id)
    console.log(opId)
    try {
        const { dataToSave } = req.body;
        const data = [{
            name: 'yellow',
            isCorrect: false
        },
        {
            name: 'green',
            isCorrect: false
        }

        ]
        const savedInputs = await Quiz.findByIdAndUpdate({ _id, 'questions._id': opId }, { $pull: { 'questions.$[].options': { _id: obj } } },
            { new: true })
        res.status(201).json(savedInputs);
        console.log('success')
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
});


app.get('/create-quiz', async (req, res) => {
    try {
        const data = await Quiz.find({})
        res.json(data)
    } catch (error) {
        console.log(error)
    }
})

// student answer 
app.post('/submit-quiz/:userId', async (req, res) => {
    const { userId } = req.params
    console.log(userId)
    try {
        const { quizId, answers, score } = req.body;

        const studAnswer = new studentAnswer({
            quizId,
            userId,
            answers,
            score
        });

        await studAnswer.save();

        res.status(201).json({ message: 'Answers submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/create-quiz/:myId/:opId', async (req, res) => {
    const _id = req.params.myId
    const opId = req.params.opId

    const obj = '6627d0ce92c60f196899a91b'
    console.log(_id)
    console.log(opId)
    try {
        const dataToSave = req.body;
        const data = [{
            name: 'yellow',
            isCorrect: false
        },
        {
            name: 'green',
            isCorrect: false
        }

        ]
        const savedInputs = await Quiz.findByIdAndUpdate({ _id, 'questions._id': opId }, { $push: { 'questions.$[].options': dataToSave } },
            { new: true })
        res.status(201).json(savedInputs);
        console.log('success')
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
});




app.put('/update', async (req, res) => {
    const { userId, id, options } = req.body;

    try {
        // Update the details in the nested array
        const updatedUser = await Quiz.findOneAndUpdate(
            { _id: userId, 'questions._id': id },
            { $set: { 'contacts.$.details': options } },
            { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// display questions
app.get('/questions', async (req, res) => {
    try {
        const quiz = await Quiz.find({})
        res.json(quiz)
        console.log(quiz)
    } catch (error) {

    }
})



// display quiz by author
app.get('/author', verifyToken, async (req, res) => {
    try {

        const author = req.userId
        try {
            const quiz = await Quiz.find({ author: author })
            if (quiz) {
                res.json(quiz)
            }
            console.log(quiz)
        } catch (error) {

        } // Return the quizzes
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// publish quiz
app.patch('/publish-quiz/:quizId', async (req, res) => {
    try {
        const { quizId } = req.params;

        // Generate a unique code for the quiz
        const code = generateCode(); // Creates a unique identifier
        console.log(code)

        // Update the quiz to be published and set the unique code
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            { published: true, code },
            { new: true } // Return the updated quiz
        );

        res.json({ message: 'Quiz published', quiz: updatedQuiz, code: code });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// unpublish quiz
app.patch('/unpublish-quiz/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            { published: false, code: '' }, // Clear the code when unpublishing
            { new: true }
        );

        if (!updatedQuiz) {
            return res.status(404).send('Quiz not found');
        }

        res.status(200).send({ message: 'Quiz unpublished' });
    } catch (error) {
        res.status(500).send({ message: 'Error unpublishing quiz', error });
    }
});

// access quiz by code
app.post('/quiz-by-code/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const quiz = await Quiz.findOne({ code });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found or not published' });
        }

        res.json(quiz); // Return the quiz data
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// student answers
app.post('/student/submit-quiz', async (req, res) => {
    try {
        const { quizId, studentId, answers, score } = req.body;
        const studAnswer = new studentAnswer({ quizId, studentId, answers, score })
        await studAnswer.save()
        console.log(studAnswer)
    } catch (error) {
        console.log(error)
    }
})

app.get('/getStudents/:quizId', async (req, res) => {
    try {
        const { quizId } = req.params
        const quiz = await Quiz.findById({ _id: quizId })
        console.log(quiz._id)

        const student = await studentAnswer.find({ quizId: quiz._id }).populate('userId').exec();

        const stud = student.map(answer => ({
            student: answer.userId.username,
            score: answer.score
        }))

        console.log(stud.length)
        res.json(stud)
        // console.log('this is student answer:',student.userId)

    } catch (error) {
        console.log(error)
    }
})

// code generator
function generateCode() {
    // Pool of uppercase letters and digits
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;

    let code = '';

    // Generate a secure random 8-character code
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        code += characters[randomIndex];
    }

    return code;
}

const PORT = 3000
app.listen(PORT, () => {
    console.log('server is running')
})