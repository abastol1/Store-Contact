var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MapboxClient = require('mapbox');
var geo = require('mapbox-geocoding');

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

        var toSend = {
            fullName: document.prefix + " " + document.firstName + " " + document.lastName,
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

app.get("/contacts", urlencodedParser, (req, res) => {
    Contact.find({}, (err, data) => {
        console.log("lenngth is " + data.length);
        console.log("Each is " + JSON.stringify(data[0]));
        res.render('contacts.pug', { data: data });
        // res.send(data);
    });
})


app.post('/update', urlencodedParser, function (req, res) {
    var newData = req.body;
    console.log("Inside post method");
    console.log("Firstname in post update is " + newData.firstName);
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
        // console.log("Longitude is " + lng);
        // console.log("Latitude  is " + lat);
        newData.lat = lat;
        newData.lng = lng;
        console.log("Object is " + JSON.stringify(newData));

        Contact.updateOne(
            { "_id": newData.custId },
            { $set: { "prefix": newData.prefix, "firstName": newData.firstName, "lastName": newData.lastName, "street": newData.street, "city": newData.city, "state": newData.state, "zip": newData.zip, "phone": newData.phoneNum, "email": newData.emailAdd, "lat": newData.lat, "lng": newData.lng, "contactByMail": mailBool, "contactByPhone":isPhone, "contactByEmail":isEmail } }
        )
            .then((obj) => {
                console.log("Updated - " + JSON.stringify(obj));
                Contact.find({}, (err, data) => {
                    console.log("lenngth is " + data.length);
                    console.log("All data after alert is  " + JSON.stringify(data));
                    // res.send(data);
                    res.render('contacts.pug', { data: data });
                });
            })
    });
})

app.post('/delete', function (req, res) {
    console.log("Inside delete post method in server");
    console.log("Inside delete is " + req.body.contactId);

    var query = Contact.remove({ _id: req.body.id });

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