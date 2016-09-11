//Require de los package que se utilizan para la aplicacion
var express = require('express');
var mongoose = require('mongoose');

//Variable con la ejecucion de Express
var app = express();

//Conexion con la base de datos
mongoose.connect('mongodb://localhost/paginawebconnode');

//Definicion del Schema que se va a usar para almacenar los datos en MongoDB
var productSchema = {
	title: String,
	description: String,
	imageUrl: String,
	pricing: Number
};

//Declaracion del model Product
var Product = mongoose.model("Product", productSchema);

//Le decimos a la aplicacion que las visas se van a hacer con jade
app.set("view engine", "jade");

/*Definimos en donde se van a guardar los archivos estaticos con el metodo
static de express*/
app.use(express.static("public"));

/* Se ejecuta al momento de ingresar al servidor "localhost:8080" y devuelve una respuesta 
en este caso hace el render del index */ 
app.get("/", function(solicitud, respuesta){
	respuesta.render("index");
});

//Le decimos a express que escuche en el puerto 8080
app.listen(8080);