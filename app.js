//Hacemos el require de express
var express = require('express');
//Declaramos la variable donde se ejectuta express
var app = express();
//Le decimos a la aplicacion que las visas se van a hacer con jade
app.set("view engine", "jade");

/* Se ejecuta al momento de ingresar al servidor "localhost:8080" y devuelve una respuesta 
en este caso hace el render del index */ 
app.get("/", function(solicitud, respuesta){
	respuesta.render("index");
});

//Le decimos a express que escuche en el puerto 8080
app.listen(8080);