var socket = io("http://f4bio16.asuscomm.com:3000");
var configurator = {};
$('#toggle-blink').on('click', function()
{
	socket.emit('toggle', 1);
});
$('#led-off').on('click', function()
{
	socket.emit('off', 1);
});
socket.on('ledStatus', function(msg)
{
	console.log(msg);
	$('#ledColor').css(
		'background-color',
		'rgb('+msg.led_info.red+','
		+msg.led_info.green+','
		+msg.led_info.blue+")");
});
socket.on('configurator', function(config)
{
	configurator = config;
	$("#timeInterval").val(configurator.timeInterval);
});
$("#changeTimeInterval").on('click', function()
{
	socket.emit('setTimeInterval', $("#timeInterval").val());
});
