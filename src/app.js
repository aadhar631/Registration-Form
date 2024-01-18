require('dotenv').config();

const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
require("./db/conn");

const Register = require("./models/registers");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../template/views");
const partials_path = path.join(__dirname, "../template/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);
hbs.registerPartials(template_path);

// console.log(process.env.SECRET_KEY);

app.get("/" , (req,res) => {
    res.render("index");
});

app.get("/register" , (req,res) => {
    res.render("register");
});

app.get("/login" , (req,res) => {
    res.render("login");
});

// create a new user in our database 
app.post("/register" , async (req,res) => {
    try {
        const registerEmployee = new Register({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        })

        const token = await registerEmployee.generateAuthToken();

        const registered = await registerEmployee.save();

        res.status(201).render("index");

    } catch (error) {
        res.status(400).send("User already exists");
        console.log("the error in register", error);
    }
});

// login check 
app.post("/login", async (req,res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the success :- " + token);

        if(isMatch) {
            res.status(201).render("index");
        } else {
            res.send("Password is incorrect. Please try again!")
        }
    } catch (error) {
        res.status(400).send("Invalid Email");
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});