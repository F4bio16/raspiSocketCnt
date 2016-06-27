var wpi = require('wiring-pi');
// var app = require('express')();
var express = require('express');
app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

wpi.setup('wpi');
app.use(express.static(path.join(__dirname, 'public')));

var scheduler = null;

var runningState = 0;

var pinGreen = 4;
var pinBlue = 3;
var pinRed = 5;

var configurator = 
	{
		timeInterval: 500,
		setTimeInterval : function(time)
		{
			console.log("changing timeInterval to "+time+" ms");
			this.timeInterval = time;
		},
		getTimeInterval : function()
		{
			return this.timeInterval;
		}
	};
var colorSequences = new Array(
  [1,0,0],
  [1,1,0],
  [0,1,0],
  [0,1,1],
  [0,0,1],
  [1,0,1],
  [1,1,0],
  [0,1,0],
  [0,1,1],
  [0,0,1],
  [0,1,1],
  [0,1,0],
  [1,1,0],
  [1,0,0],
  [1,0,1],
  [0,0,1],
  [0,1,1],
  [0,1,0],
  [1,1,0],
  [1,0,0],
  [0,0,0],
  [1,1,1],
  [0,0,0],
  [1,1,1]
/*
  [0,1,0],
  [0,0,1],
  [0,1,0],
  [1,0,0],
  [0,1,0],
  [0,0,1],
  [1,1,1],
  [0,0,0],
  [1,1,1],
  [1,1,0],
  [0,1,1],
  [1,0,1],
  [0,0,0],
  [1,1,1],
  [0,0,0],
  [1,1,1],
  [0,0,0]
*/
);
var colorIndex = 0;

wpi.pinMode(pinGreen, wpi.OUTPUT);
wpi.pinMode(pinBlue, wpi.OUTPUT);
wpi.pinMode(pinRed, wpi.OUTPUT);

app.get('/', function(req,res)
{
   res.sendFile("view/startbootstrap-bare-1.0.4/index.html", { root: __dirname} );
});

io.on('connection', function(socket)
{
  console.log('a user connected');
  io.emit('configurator', configurator );
  
  socket.on('toggle', function(msg)
  {
    if(!runningState)
    {
      scheduler = startScheduler();
    }else
    {
      clearInterval(scheduler);
    }
    runningState = !runningState;
  });

  socket.on("off", function()
    {
      if(runningState)
	 clearInterval(scheduler);
      runningState = false;
      setRGBLed([0,0,0]);
    });
  socket.on("setTimeInterval", function(timeInterval)
    {
console.log("configuration message");
      configurator.setTimeInterval(timeInterval);
    });
});


function startScheduler()
{
   return setInterval(function()
   {
     if(colorIndex >= colorSequences.length-1)
       colorIndex = 0;
     setRGBLed(colorSequences[colorIndex++]);
   }, configurator.getTimeInterval());
}


http.listen(3000, function()
{
  console.log('listening on *:3000');
});

function setRGBLed(colors)
{
   wpi.digitalWrite(pinRed,   colors[0]);
   wpi.digitalWrite(pinGreen, colors[1]);
   wpi.digitalWrite(pinBlue,  colors[2]);
   var rgbColors = {red:0, blue:0, green:0};
   if(colors[0]) rgbColors.red	= 255;
   if(colors[1]) rgbColors.green= 255;
   if(colors[2]) rgbColors.blue	= 255;
   io.emit('ledStatus', { led_info: rgbColors } );
}
