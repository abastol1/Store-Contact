var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set('view engine', 'pug');
app.use(express.static('views'));


var Contact = mongoose.model('Contact', {
    firstName: String,
    lastName: String,
    street: String,
    state: String,
    zip: String,
    phone: String,
    email: String,
    prefix: String,
    contactByMail: Boolean,
    contactByPhone: Boolean,
    contactByEmail: String
});

var document = {
    firstName: "Anuj",
    secondName: "Bastola",
    street: "505 Ramapo Valley Road",
    state: "New Jersey",
    zip: "07430",
    phone: "5512629132",
    email: "abastol1@ramapo.edu",
    prefix: "Mr",
    contactByMail: true,
    contactByPhone: false,
    contactByEmail: "abastol1@ramapo.edu"
}

Contact.insertMany(document);

mongoose.connect('mongodb://webfinal:webfinal1@ds015942.mlab.com:15942/webappfinal', { useNewUrlParser: true }, (err) => {
    console.log('Mongodb Connected', err);
})


app.get('/mailer', function (req, res) {
    res.sendFile(__dirname + '/views/home/index.html');
})


app.post('mailer', urlencodedParser, (req, res) => {
    let mailBool = "No";
    let isPhone = "No";
    let isEmail = "No";

    if (req.body.mail == "Mail" || req.body.any == "Any") {
        mailBool = "Yes";
    }
    if (req.body.phone == "Phone" || req.body.any == "Any") {
        isPhone = "Yes";
    }
    if (req.body.email == "Email" || req.body.any == "Any") {
        isEmail = req.body.emailAdd;
    }


    var document = {
        firstName: req.body.firstName,
        secondName: req.body.lastName,
        street: req.body.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
        email: req.body.email,
        prefix: req.body.prefix,
        contactByMail: mailBool,
        contactByPhone: isPhone,
        contactByEmail: isEmail
    }


})


app.listen(3000);