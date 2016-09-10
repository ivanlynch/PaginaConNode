//Require de express
var express = require('express');
//Declaramos la variable donde se ejectuta express
var app = express();

/* Se ejecuta al momento de ingresar al servidor "localhost:8080" y devuelve una respuesta */

app.get("/", function(solicitud, respuesta){
	respuesta.send("Hola Mundo");
});

//Le decimos a express que escuche en el puerto 8080
app.listen(8080);