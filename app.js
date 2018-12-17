var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MapboxClient = require('mapbox');
var geo = require('mapbox-geocoding');
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');

var bcrypt = require("bcrypt");

geo.setAccessToken('pk.eyJ1IjoiYWJhc3RvbDEiLCJhIjoiY2pvc3htNnZmMHJzNTNvczBqYWRnd2FqZyJ9.2tD5ZaeSDK46QnnjMnNCTw');

var app = express();
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set('view engine', 'pug');
app.use(express.static('views'));


var Contact = mongoose.model('Contact', {
    prefix: String,
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    email: String,
    contactByMail: String,
    contactByPhone: String,
    contactByEmail: String,
    lat: String,
    lng: String
});

mongoose.connect('mongodb://webfinal:webfinal1@ds015942.mlab.com:15942/webappfinal', { useNewUrlParser: true }, (err) => {
    console.log('Mongodb Connected', err);
})

// Aunthentication
var username = "cmps369";
var password = "finalproject";

bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
        password = hash;
        console.log("Hashed password = " + password);
    });
});


app.use(bodyParser.json());
app.use(favicon());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({secret: 'cmps369'}))


// Set up passport to help with user authentication (guest/password)
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },

    function (user, pswd, done) {
        if (user != username) {
            console.log("Username mismatch");
            return done(null, false);
        }

        bcrypt.compare(pswd, password, function (err, isMatch) {
            if (err) return done(err);
            if (!isMatch) {
                console.log("Password mismatch");
            }
            else {
                console.log("Valid credentials");
            }
            done(null, isMatch);
        });
    }
));

passport.serializeUser(function (username, done) {
    // this is called when the user object associated with the session
    // needs to be turned into a string.  Since we are only storing the user
    // as a string - just return the username.
    done(null, username);
});

passport.deserializeUser(function (username, done) {
    // normally we would find the user in the database and
    // return an object representing the user (for example, an object
    // that also includes first and last name, email, etc)
    done(null, username);
});


app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/contacts',
        failureRedirect: '/login_fail',
    })
);

var ensureLoggedIn = function (req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect("/login");
    }
}
app.get('/login', function (req, res) {
    console.log("Inside get login");
    res.render('login', {});
});

app.get('/login_fail', function (req, res) {
    console.log("Inside get login_fail");
    res.render('login_fail', {});
});

app.get('/logout', function (req, res) {
    console.log("Inside get Logout");
    req.logout();
    res.redirect('/login');
});

app.get('/mailer', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
})

app.post('/mailer', urlencodedParser, (req, res) => {
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

    if (isPhone == "Yes") {
        isPhone = req.body.phoneNum;
    }
    const addressToGeoCode = req.body.street + ", " + req.body.city + ", " + req.body.state + " " + req.body.zip;
    console.log("Address to geocode is " + addressToGeoCode);

    geo.geocode('mapbox.places', addressToGeoCode, function (err, geoData) {
        const lng = geoData.features[0].center[0];
        const lat = geoData.features[0].center[1];
        console.log("Longitude is " + lng);
        console.log("Latitude  is " + lat);

        var document = {
            prefix: req.body.prefix,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phoneNum,
            email: req.body.emailAdd,
            contactByMail: mailBool,
            contactByPhone: isPhone,
            contactByEmail: isEmail,
            lat: lat,
            lng: lng
        }
        var fullName = document.firstName + " " + document.lastName;
         
        if (typeof document.prefix == "undefined"){
            console.log("UNDEFINED PREFIX")
            // DO not add prefix to name
        }
        else {
            // add prefix to name
            fullName = document.prefix + " " + fullName;
        }

        var toSend = {
            fullName: fullName,
            address: document.street + ", " + document.city + ", " + document.state + " " + document.zip,
            contactByPhone: isPhone,
            contactByMail: mailBool,
            contactByEmail: isEmail,
            lng: lng,
            lat: lat
        }

        console.log("The document is " + JSON.stringify(document));
        Contact.insertMany(document);
        res.render('mapPage/mapContactPage.pug', { toSend: toSend });

    });
})

app.get("/contacts" , ensureLoggedIn, (req, res) => {
    console.log("Inside get contacts");
    Contact.find({}, (err, data) => {
        console.log("lenngth is " + data.length);
        console.log("Each is " + JSON.stringify(data[0]));
        res.render('contacts.pug', { data: data });
    });
})


app.post('/update', ensureLoggedIn, function (req, res) {
    var newData = req.body;
    console.log("New Data is " + JSON.stringify(newData));
    var fullAddress = newData.street + " " + newData.city + " " + newData.state + " " + newData.zip;
    console.log("Fulll address is " + fullAddress);
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

    if (isPhone) {
        isPhone = req.body.phoneNum;
    }

    geo.geocode('mapbox.places', fullAddress, function (err, geoData) {
        const lng = geoData.features[0].center[0];
        const lat = geoData.features[0].center[1];
        newData.lat = lat;
        newData.lng = lng;

        Contact.updateOne(
            { "_id": newData.custId },
            { $set: { "prefix": newData.prefix, "firstName": newData.firstName, "lastName": newData.lastName, "street": newData.street, "city": newData.city, "state": newData.state, "zip": newData.zip, "phone": newData.phoneNum, "email": newData.emailAdd, "lat": newData.lat, "lng": newData.lng, "contactByMail": mailBool, "contactByPhone": isPhone, "contactByEmail": isEmail } }
        )
            .then((obj) => {
                console.log("Updated - " + JSON.stringify(obj));
                Contact.find({}, (err, data) => {
                    console.log("All data after alert is  " + JSON.stringify(data));
                    res.render('contacts.pug', { data: data });
                });
            })
    });
})

app.post('/delete', ensureLoggedIn, function (req, res) {
    console.log("Id is " + req.body.contactId);
    Contact.deleteOne({ "_id": req.body.contactId }, function (err) {
        if (err) {
            throw err;
        }
        else {
            console.log("Deleted!!!!!!!!!!!!!");
            res.send("Success");
        }
    });
})

app.listen(3000); 