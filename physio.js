var ibmdb = require('ibm_db'),
    cn = "DRIVER={DB2};DATABASE=RSDB;HOSTNAME=null.net;UID=rishi;PWD=null;PORT=50000;PROTOCOL=TCPIP";

var app = require('express')();

var http = require('http').Server(app),
    s = require('net');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var io = require('socket.io')(http);

var plist;
var pID,hrdata,spo2data,irwdata;
var data = {};

/*********************************************************/
ibmdb.open(cn, function (err,conn) {
  if (err) return console.log(err);

  conn.query("select distinct(patient_id) from DB2INST1.DM_ARTEMIS_TA_FOAK_SPELLS with ur", [42], function (err, data) {
    if (err) console.log(err);
	plist = data;
	console.log(plist);
  });

    conn.close(function () {
      console.log('done getting patients');
    });

});

/*********************************************************/
//**TODO: Fix Queries for individual clients so jsons don't overwrite each other

app.use(require('express').static(__dirname + '/public'));

io.on('connection', function(socket){

    console.log('a user connected');

    socket.on('getInstData', function(msg) {
        pID = msg.patient;
        start = msg.startdate;
        end = msg.enddate;

        if (start) {
          console.log("this is the start: %s and end: %s", start, end);
          ibmdb.open(cn, function(err, conn){
              //blocks until the query is completed and all data has been acquired
              var instdata = conn.querySync("SELECT * FROM db2inst1.DM_ARTEMIS_TA_FOAK_SPELLS WHERE ACTUALSTARTTIME >="+ start +" AND ACTUALSTARTTIME <="+ end + " AND PATIENT_ID=\'"+pID+"\' AND ABSTRACTIONTYPE NOT IN ('Iso RI pause', 'spo2_baseline_pct', 'hr_baseline_pct', 'Unclassified') order by ACTUALSTARTTIME desc");
              console.log("fetched this much data rows: %d", instdata.length);
              io.emit('sendInstData', instdata);
              conn.close(function (err) {
                  console.log("the database connection is now closed");
              });
              console.log("fetched this much data rows: %d", instdata.length);
            })
          };


        // starttime = (msg.startdate.getTime()/1000);
        // endtime = (msg.enddate.getTime()/1000);
    });

    socket.on('getPtData', function(msg) {

                pID = msg.pID;
                starttime = msg.date - 30;
                endtime = msg.date + msg.duration + 30;

                console.log('start: ' + starttime + ' end: ' + endtime);

                if (starttime) {

            //     ibmdb.open(cn, function (err,conn) {

            //     if (err) return console.log(err);

            //     conn.query("SELECT * FROM db2inst1.rawhr WHERE READINGEPOCH >='"+ starttime +"' AND READINGEPOCH <='"+ endtime + "' AND HRVALUE < 400 AND PATIENTID=\'"+pID+"\' order by readingepoch desc", [42], function (err, data) {
            //       if (err) console.log(err);
            //       hrdata = data;

            //     });

            //     // conn.query("SELECT * FROM db2inst1.rawIRW WHERE  READINGEPOCH >='"+ starttime +"' AND READINGEPOCH <='"+ endtime + "' AND PATIENTID=\'"+pID+"\' order by readingepoch desc", [42], function (err, data) {
            //     //   if (err) console.log(err);
            //     //   irwdata = data;
            //     //
            //     // });

            //     conn.query("SELECT * FROM db2inst1.rawspo2 WHERE READINGEPOCH >='"+ starttime +"' AND READINGEPOCH <='"+ endtime + "' AND SPO2VALUE < 400 AND SPO2VALUE > 0 AND PATIENTID=\'"+pID+"\' order by readingepoch desc", [42], function (err, data) {
            //       if (err) console.log(err);
            //       spo2data = data;
            //     });

            //       conn.close(function () {
            //         console.log('done getting patient data');
            //       });

            // });

          ibmdb.open(cn, function(err, conn){
              //blocks until the query is completed and all data has been acquired
              var irwdata = conn.querySync("SELECT * FROM db2inst1.rawIRW WHERE  READINGEPOCH >="+ starttime +" AND READINGEPOCH <="+ endtime + " AND PATIENTID=\'"+pID+"\' order by READINGEPOCH desc");
              io.emit('sendIRWData', irwdata);
              //console.log(irwdata);
              var hrdata = conn.querySync("SELECT * FROM db2inst1.rawHR WHERE HRVALUE < 400 AND READINGEPOCH >="+ starttime +" AND READINGEPOCH <="+ endtime + " AND PATIENTID=\'"+pID+"\' order by READINGEPOCH desc");
              io.emit('sendHRData', hrdata);
              console.log(hrdata);
              var spo2data = conn.querySync("SELECT * FROM db2inst1.rawSPO2 WHERE SPO2VALUE < 400 AND READINGEPOCH >="+ starttime +" AND READINGEPOCH <="+ endtime + " AND PATIENTID=\'"+pID+"\' order by READINGEPOCH desc");
              io.emit('sendSPO2Data', spo2data);
              conn.close(function (err) {
                  console.log("the database connection is now closed");
              });
            })
        }
    })


});


http.listen(8888, '127.0.0.1');

console.log('Server running at http://localhost:8888/');
console.log('Connect to http://localhost:8888/index.html');
