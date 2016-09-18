//Require de los package que se utilizan para la aplicacion
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require("cloudinary");
var method_override = require("method-override");
var app_password = "12345678";

/* Declaracion de Multer */
var upload = multer({ dest: './uploads' });
var middleware_upload = upload.single('image_product');

/* Configuracion de Cloudinary */
cloudinary.config({
	cloud_name: "ivanlynch",
	api_key: "358116339799319",
	api_secret: "FnEN3Jtb6Q4m1D9e7IoAffr7WPk"
})

//Variable con la ejecucion de Express
var app = express();

//Conexion con la base de datos
mongoose.connect('mongodb://localhost/paginawebconnode');

/* Declaramos que  express va a utilizar body-parser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(method_override("_method"));

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

/* Devuelve los productos que se almacenaron */
app.get("/menu", function(solicitud, respuesta){
	Product.find(function(error, documento){
		if(error){ console.log(error);}
		respuesta.render("menu/index", { products: documento })
	});
});

/* Edit de la imagen */
app.get("/menu/edit/:id", function(solicitud, respuesta){
	var id_producto = solicitud.params.id;
	Product.findOne({"_id": id_producto}, function(error, producto){
		respuesta.render("menu/edit", { product: producto});
	});
});

app.put("/menu/:id", middleware_upload, function(solicitud, respuesta){
	if(solicitud.body.password == app_password){
		var data = {
			title: solicitud.body.title,
			description: solicitud.body.description,
			pricing: solicitud.body.pricing
		};

		Product.update({"_id": solicitud.params.id}, data, function(){
			respuesta.redirect("/menu");
		});
	}else{
		respuesta.redirect("/");
	}
	
});

/* Panel de Administrador */
app.post("/admin", function(solicitud, respuesta){
	if(solicitud.body.password == app_password){
		Product.find(function(error, documento){
		if(error){ console.log(error);}
			respuesta.render("admin/index", { products: documento })
		});
	}else{
		respuesta.redirect("/");
	}
});

/* Inicio de Administrador */
app.get("/admin", function(solicitud, respuesta){
	respuesta.render("admin/form")
});

/* Despues de hacer un post en Menu te hace el render al Index */
app.post("/menu", middleware_upload, function(solicitud, respuesta){

	/* Requerimos la contraseña para hacer un post*/
	if(solicitud.body.password == app_password){

		/* Declaracion del objeto que se utiliza para almacenar
		   los datos que vienen del formulario /menu/new */
		var data = {
			title: solicitud.body.title,
			description: solicitud.body.description,
			imageUrl: "data.png",
			pricing: solicitud.body.pricing
		}

		/* Crea una instancia del modelo para almacenar un objeto */
		var product = new Product(data);

		/* Si se adjunta una imagen al formulario */
		if(solicitud.file){

			/* Se pasa la ruta del archivo local a subir */
		    cloudinary.uploader.upload(solicitud.file.path,
		        function(result) {

		            product.imageUrl = result.url;

		            /* Guardó el objeto producto y hace render al index */
		            product.save(function(err){
		                respuesta.redirect("/menu");
		            });
		        }
		    );
		}
		
	}else{ /* Si la contraseña no coincide nos hace el render a menu/new */
		respuesta.render("menu/new")
	}

});

/* Render del Menu*/
app.get("/menu/new", function(solicitud, respuesta){
	respuesta.render("menu/new");
});

//Le decimos a express que escuche en el puerto 8080
app.listen(8080);