
const express = require('express');
const path = require('path');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.render('index', { isLoggedIn: false });
    }
    next();
};



const app = express();

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.get('/', isLoggedIn, async (req, res) => {
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, 'shh');
        const user = await userModel.findById(decoded.userid);
        res.render('index', { isLoggedIn: true, user: user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



// register routes
app.get('/register', (req, res) => {
    res.render('register', { isLoggedIn: false });
})

app.post('/register', async (req, res) => {

    let { username,
        password,
        email,
        phone } = req.body;

    let user = await userModel.findOne({ username });
    if (user) {
        return res.status(500).send(`Already Registered`);
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let user = await userModel.create({

                    username,
                    password: hash,
                    email,
                    phone,

                });

                let token = jwt.sign({ email: email, userid: user._id }, "shh");
                res.cookie("token", token);

                res.redirect("/login");
            });
        });
    }
})


// login routes
app.get('/login', (req, res) => {
    res.render('login', { isLoggedIn: false });
})

app.post('/login', async (req, res) => {
    let { username, password } = req.body;
    let user = await userModel.findOne({ username });
    if (!user) {
      return res.status(400).send("User not found");
    }
    // console.log(user);
  
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // res.redirect()
        let token = jwt.sign({ username: username, userid: user._id }, "shh");
        res.cookie("token", token);
        res.redirect("/");
      } else {
        res.status(400).send("Invalid Credentials");
      }
    });
})

// logout routes

app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/login');
});


// vote
app.post('/vote', async (req, res) => {
    const { candidate } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const decoded = jwt.verify(token, 'shh');
        const user = await userModel.findById(decoded.userid);

        if (user.hasVoted) {
            return res.status(400).send('You have already voted');
        }

        user.vote = candidate;
        user.hasVoted = true;
        await user.save();

        res.send('Vote recorded successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});





