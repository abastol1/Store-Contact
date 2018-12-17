
$(document).ready(function () {
    console.log("I am inside Geocoding.js");

    mapboxgl.accessToken = 'pk.eyJ1IjoiYWJhc3RvbDEiLCJhIjoiY2pvc3htNnZmMHJzNTNvczBqYWRnd2FqZyJ9.2tD5ZaeSDK46QnnjMnNCTw';

    $('#updateForm').hide();

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [-74.003807, 40.753250],
        zoom: 13
    });

    var marker = new mapboxgl.Marker()
        .setLngLat([-74.003807, 40.753250])
        .addTo(map);


    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    // -------------------------------------------------------------------------------------------------------------------------------
    // adding marker 

    $('table > tbody > tr').each(function () {
        console.log("--------------------------------------");
        var lat = $(this).data("lat");
        var lng = $(this).data("lng");

        console.log("Lat is " + lat);
        console.log("Lng is " + lng);

        var marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map);
    });

    // -------------------------------------------------------------------------------------------------------------------------------
    // When user clicks on any row in the table, this function is called to center the map to that particular location
    $(".clickable").on("click", "tr", function () {
        var name = $(this).data("name");
        var prefix = $(this).data("prefix");
        var address = $(this).data("address");
        var lat = $(this).data("lat");
        var lng = $(this).data("lng");
        var phone = $(this).data("phone");
        var email = $(this).data("email");
        console.log("Name is " + name);
        console.log("Prefix is " + prefix)
        if (typeof prefix == "undefined") {
            console.log("UNDEFINED PREFIX")
            // DO not add prefix to name
        }
        else {
            // add prefix to name
            name = prefix + " " + name;
        }

        var description = "<h6>" + name + "</h6>" + "<h6>" + address + "</h6>" + "<h6>" + phone + "</h6>" + "<h6>" + email + "</h6>";
        var popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat([lng, lat])
            .setHTML(description)
            .addTo(map);

        map.flyTo({
            center: [lng, lat]
        });
    })

    // -------------------------------------------------------------------------------------------------------------------------------
    $(".clickable-row").on("click", "#updateButton", function () {
        console.log("Button is clicked");
        $("#container").hide();
        $("#map").hide();
        $('form').show();

        var prefix = $(this).data("prefix");
        var firstName = $(this).data("firstname");
        var lastName = $(this).data("lastname");
        var street = $(this).data("street");
        var city = $(this).data("city");
        var state = $(this).data("state");
        var zip = $(this).data("zip");
        var email = $(this).data("email");
        var phone = $(this).data("phone");
        console.log("id is " + $(this).data("id"));
        if (prefix == "Mr.") {
            console.log("Inside mr.");
            $("#radio1").prop("checked", true);
        }
        else if (prefix == "Mrs.") {
            $("#radio2").prop("checked", true);
        }
        else if (prefix == "Ms.") {
            $("#radio3").prop("checked", true);
        }
        else {
            $("#radio4").prop("checked", true);
        }

        $("#inputFirstName4").val(firstName);
        $("#inputFirstName4").attr('data-id', $(this).data("id"));
        $("#custId").val($(this).data("id"));

        $("#inputLastName4").val(lastName);
        $("#inputAddress").val(street);
        $("#inputAddress2").val(city);
        $("#inputState").val(state).attr("selected", "selected");
        $("#inputZip").val(zip);
        $("#inputPhone").val(phone);
        $("#inputEmail").val(email);

    })

    $(".clickable-row").on("click", "#deleteButton", function () {
        console.log("Inside Delete button");
        var id = { contactId: $(this).data('id') };
        console.log("Delete id is " + id);
        $(this).parent().parent().remove();


        $.ajax({
            type: 'POST',
            data: JSON.stringify(id),
            contentType: 'application/json',
            url: 'http://localhost:3000/delete',
            success: function (data) {
                alert("Contact Deleted ");
            },
            error: function (err) {
                alert("ERROR!")
            }
        });
    });

    $("#searchTable").on("keyup", function () {
        console.log("Inside filter");
        var value = $(this).val().toLowerCase();
        $("#tableBody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});




