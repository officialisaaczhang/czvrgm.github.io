let vatsimData = "https://afternoon-journey-90339.herokuapp.com/https://data.vatsim.net/v3/vatsim-data.json";
let dataStream2 = "https://cors.bridged.cc/https://data.vatsim.net/v3/vatsim-data.json";
let datawocors = "https://data.vatsim.net/v3/vatsim-data.json";
let trafficArray = [];
let pilotTable = null;
let long_episilon = 0.00030000;
let lati_episilon = 0.00020000;
let flights = null;

setInterval(update_all, 300*1000);

$(document).ready(function() {   
    $.getJSON(vatsimData, function(data){
        flights = data["pilots"];
        for (i = 0; i < flights.length; i++) {
            if (flights[i]["flight_plan"] == null) {
                continue;
            } else if (flights[i]["flight_plan"]["departure"] == "CYVR" && flights[i]["groundspeed"] == 0) {
               trafficArray.push(flights[i]); //needed edit...
            }
        }
        // console.log(flights);
        // console.log(trafficArray)
        map_init();
        load_table();
        document.getElementById("time").innerHTML = "Last Updated: " + data["general"]["update_timestamp"];
    })
});

function map_init() {
    /* Create map */
    var mymap = L.map('mapid').setView([49.1937222,-123.1738889], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', 
    {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
    ).addTo(mymap);

    $.getJSON("cyvrjetgates.json", function(gatedata){
        for (a = 0; a < flights.length; a++) {
            for (b = 0; b < gatedata.length; b++) {
                var diff_long = Math.abs(flights[a]["longitude"] - gatedata[b]["longitude"]);
                var diff_lati = Math.abs(flights[a]["latitude"] - gatedata[b]["latitude"]);
                if (diff_long <= long_episilon && diff_lati <= lati_episilon) {
                    gatedata[b]["occupied"] = flights[a]["callsign"];
                }
            }
        }
        // console.log(gatedata);
        for (i = 0; i < gatedata.length; i++) {
            if (gatedata[i]["occupied"] == "false") {
                var circle = L.circle([gatedata[i]["latitude"], gatedata[i]["longitude"]], {
                    color: 'green',
                    // fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 15
                }).addTo(mymap);
            } else {
                var circle = L.circle([gatedata[i]["latitude"], gatedata[i]["longitude"]], {
                    color: 'red',
                    // fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 15
                }).addTo(mymap);
                }
        }
    });
}

function load_table() {
    pilotTable = document.getElementById('myTable')
    for (var i = 0; i < trafficArray.length; i++){
        var row = `<tr>
                        <td>${trafficArray[i]["callsign"]}</td>
                        <td>${trafficArray[i]["flight_plan"]["departure"]}</td>
                        <td>${trafficArray[i]["flight_plan"]["arrival"]}</td>
                        <td>${trafficArray[i]["flight_plan"]["aircraft"]}</td>
                  </tr>`
        pilotTable.innerHTML += row
    }
}

function update_all() {
    window.location.reload();
}