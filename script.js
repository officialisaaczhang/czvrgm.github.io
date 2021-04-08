let vatsimData = "https://data.vatsim.net/v3/vatsim-data.json";
let trafficArray = [];
let airportElevations = {CYVR:200, CYYJ:200}
let pilotTable = null;
let long_episilon = 0.00000500;
let lati_episilon = 0.00000500;
let occupied = []

setInterval(update_all, 120*1000);

$(document).ready(function() {   
    $.getJSON(vatsimData, function(data){
        flights = data["pilots"];
        for (i = 0; i < flights.length; i++) {
            if (flights[i]["flight_plan"] == null) {
                continue;
            } else if (flights[i]["flight_plan"]["departure"] == "CYVR" && flights[i]["groundspeed"] == 0) {
               trafficArray.push(flights[i]);
            }
        }
        load_table();
        map_init();
    })
});

function map_init() {
    /* Create map */
    var mymap = L.map('mapid').setView([49.1947222,-123.1838889], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', 
    {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
    ).addTo(mymap);

    $.getJSON("cyvrjetgates2.json", function(gatedata){
        for (a = 0; a < trafficArray.length; a++) {
            for (b = 0; b < gatedata.length; b++) {
                var diff_long = Math.abs(trafficArray[a]["longitude"] - gatedata[b]["longitude"]);
                var diff_lati = Math.abs(trafficArray[a]["latitude"] - gatedata[b]["latitude"]);
                if (diff_long <= long_episilon && diff_lati <= lati_episilon) {
                    gatedata[b]["occupied"] = "true";
                }
            }
        }
        console.log(gatedata);
        for (i = 0; i < gatedata.length; i++) {
            if (gatedata[i]["occupied"] == "false") {
                var circle = L.circle([gatedata[i]["latitude"], gatedata[i]["longitude"]], {
                    color: 'green',
                    // fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 15
                }).addTo(mymap);
            } else if (gatedata[i]["occupied"] == "true") {
                var circle = L.circle([gatedata[i]["latitude"], gatedata[i]["longitude"]], {
                    color: 'red',
                    // fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 15
                }).addTo(mymap);
                }
        }
        console.log("all drawing done");
    });
    /*
    for (i = 0; i < trafficArray.length; i++) {
        var circle = L.circle([trafficArray[i]["latitude"], trafficArray[i]["longitude"]], {
            color: 'green',
            // fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 20
        }).addTo(mymap);
        console.log("Drawing for " + trafficArray[i]["callsign"] + " Done");
        }
    */
}

function load_table() {
    pilotTable = document.getElementById('myTable')
    for (var i = 0; i < trafficArray.length; i++){
        var row = `<tr>
                        <td>${trafficArray[i]["callsign"]}</td>
                        <td>${trafficArray[i]["flight_plan"]["arrival"]}</td>
                        <td>${trafficArray[i]["flight_plan"]["aircraft"]}</td>
                  </tr>`
        pilotTable.innerHTML += row
    }
}

function update_all() {
    window.location.reload();
}