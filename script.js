let vatsimData = "https://afternoon-journey-90339.herokuapp.com/https://data.vatsim.net/v3/vatsim-data.json?nocache=" + (new Date()).getTime();
let traffic = [];
let pilotTable = null;
let long_episilon = 0.00043000;
let lati_episilon = 0.00032000;
let flights = null;

setInterval(update_all, 120*1000);

$.ajaxSetup({
    cache:false
  });

$(document).ready(function() {   
    $.getJSON(vatsimData, function(raw){
        console.log(raw)
        $.getJSON("cyvrjetgates.json", function(gate_info){
            let flights = raw.pilots;
            for (f = 0; f < flights.length; f++) {
                for (g =0; g < gate_info.length; g++) {
                    var diff_long = Math.abs(flights[f].longitude - gate_info[g].longitude);
                    var diff_lati = Math.abs(flights[f].latitude - gate_info[g].latitude);
                    if (diff_long <= long_episilon && diff_lati <= lati_episilon) {
                        if (flights[f].flight_plan == null) {
                            let datastring = [flights[f].callsign, "N/A", 
                            "N/A", "N/A", gate_info[g].gate];
                            traffic.push(datastring);
                        } else {
                            let datastring = [flights[f].callsign, flights[f].flight_plan.departure, 
                            flights[f].flight_plan.arrival, flights[f].flight_plan.aircraft_short, gate_info[g].gate];
                            traffic.push(datastring);
                        }
                        gate_info[g].occupied = "true";
                        console.log("strip added");
                    }
                }
            }
            console.log(traffic)
            map_init(gate_info);
            load_table();
            document.getElementById("time").innerHTML = "Last Updated: " + raw.general.update_timestamp + ", Total connections: " + raw.general.connected_clients;
        })
    })
});

function map_init(gatedata) {
    /* Create map */
    var mymap = L.map('mapid').setView([49.1937222,-123.1738889], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', 
    {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
    ).addTo(mymap);

    for (i = 0; i < gatedata.length; i++) {
        if (gatedata[i].occupied == "false") {
            var circle = L.circle([gatedata[i].latitude, gatedata[i].longitude], {
                color: 'green',
                // fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 15
            }).addTo(mymap);
        } else if (gatedata[i].occupied == "true") {
            var circle = L.circle([gatedata[i].latitude, gatedata[i].longitude], {
                color: 'red',
                // fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 15
            }).addTo(mymap);
        }
    }
}

function load_table() {
    pilotTable = document.getElementById('myTable')
    for (var i = 0; i < traffic.length; i++){
        var row = `<tr>
                        <td>${traffic[i][0]}</td>
                        <td>${traffic[i][1]}</td>
                        <td>${traffic[i][2]}</td>
                        <td>${traffic[i][3]}</td>
                        <td>${traffic[i][4]}</td>
                  </tr>`
        pilotTable.innerHTML += row
    }
}

function update_all() {
    window.location.reload(true);
}