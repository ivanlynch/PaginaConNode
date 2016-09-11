//Require de los package que se utilizan para la aplicacion
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Variable con la ejecucion de Express
var app = express();

//Conexion con la base de datos
mongoose.connect('mongodb://localhost/paginawebconnode');

/* Declaramos que  express va a utilizar body-parser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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

/* Al acceder por localhost:8080 hace el render del index.jade */ 
app.get("/", function(solicitud, respuesta){
	respuesta.render("index");
});

/* Despues de hacer un post en Menu te hace el render al Index */
app.post("/menu", function(solicitud, respuesta){

	/* Requerimos la contraseña para hacer un post*/
	if(solicitud.body.password == "12345678"){

		/* Declaracion del objeto que se utiliza para almacenar
		   los datos que vienen del formulario /menu/new */
		var data = {
			title: solicitud.body.title,
			description: solicitud.body.description,
			imageUrl: "data.png",
			pricing: solicitud.body.pricing
		}

		/* Creacion del Objeto */
		var product = new Product(data);

		/* Guardó el objeto y hace render al index */
		product.save(function(error){
			console.log(product);
			respuesta.render("index");
		});
	}else{ /* Si la contraseña no coincide nos hace el render a menu/new */
		respuesta.render("menu/new")
	}

});

/* Render del Menu*/
app.get("/menu/new", function(solicitud, respuesta){
	respuesta.render("menu/new");
})

//Le decimos a express que escuche en el puerto 8080
app.listen(8080);