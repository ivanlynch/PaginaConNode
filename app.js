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

/* Utilizamos method override para hacer update sobre post */
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

/* Render a la vista Edit  */
app.get("/menu/edit/:id", function(solicitud, respuesta){

	/* Buscamos dentro del model el objeto */
	Product.findOne({"_id": solicitud.params.id }, function(error, producto){
		/* hacemos render a la vista edit con los valores */
		respuesta.render("menu/edit", { product: producto});
	});
});

/* Vista Edit */
app.put("/menu/:id", middleware_upload, function(solicitud, respuesta){

	/* Comprobamos que sea el administrador */
	if(solicitud.body.password == app_password){

		/* Guardamos los valores del form en un objeto data */
		var data = {
			title: solicitud.body.title,
			description: solicitud.body.description,
			pricing: solicitud.body.pricing
		};

		/* En caso de que ya exista una imagen */
		if(solicitud.file){
			/* Hacemos el upload en cloudinary */
			cloudinary.uploader.upload(solicitud.file.path, function(result){
				/* Tomamos la url existente y guardamos la url que obtenemos de cloudinary */
				data.imageUrl = result.url;

				/* Buscamos el objeto por el ID y le pasamos los valores modificados */
				Product.update({"_id": solicitud.params.id}, data, function(){

				/* Hacemos render al menu */
					respuesta.redirect("/menu");
				});
			});

		}else{

			/* Buscamos el objeto por el ID y le pasamos los valores modificados */
			Product.update({"_id": solicitud.params.id}, data, function(){

				/* Hacemos render al menu */
				respuesta.redirect("/menu");
			});
		}

	}else{
		/* En caso de que algo falle nos envia a la pagina principal*/
		respuesta.redirect("/");
	}
	
});

/* Panel de Administrador */
app.post("/admin", function(solicitud, respuesta){

	/* Si la contraseña del input es correcta */
	if(solicitud.body.password == app_password){

		/* Buscamos todos los objetos de la base de datos */
		Product.find(function(error, documento){
			/* En caso de error lo mostramos */
			if(error){ console.log(error);}
				/* Le enviamos a la vista index todos los objetos */
				respuesta.render("admin/index", { products: documento })
			});
	}else{

		/* Si la contraseña es incorrecta nos envia a la pagina principal */
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
			console.log(solicitud.file.path);
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
		}else{

			/* Guardó el objeto producto y hace render al index */
		            product.save(function(err){
		                respuesta.redirect("/menu");
		            });

		}
		
	}else{ /* Si la contraseña no coincide nos hace el render a menu/new */
		respuesta.render("menu/new")
	}

});

/* Render del Menu*/
app.get("/menu/new", function(solicitud, respuesta){
	respuesta.render("menu/new");
});

/* Vista Eliminar */
app.get("/menu/delete/:id", function(solicitud, respuesta){
	/* Buscamos un item en la base de datos con el id que recibimos como parametro */
	Product.findOne({"_id": solicitud.params.id}, function(error, producto){
		/* Una vez que lo encontramos, le enviamos a la vista el objeto entero */
		respuesta.render("menu/delete", { producto: producto});
	});
});

/* Vista con los datos de objeto Eliminar */
app.delete("/menu/:id", middleware_upload, function(solicitud,respuesta){

	/* Si la contraseña del input es correcta */
	if(solicitud.body.password == app_password){

		/* Eliminamos del model el objeto que sea igual al id que recibimos en la solicitud*/
		Product.remove({"_id": solicitud.params.id}, function(error){

			/* En caso de error lo mostramos*/
			if(error){console.log(error); }

			/* Nos envia al menu principal */
			respuesta.redirect("/menu");
		});
	}else{
		/* Si la contraseña es incorrecta nos envia a la pagina principal */
		respuesta.redirect("/");
	}
});

//Le decimos a express que escuche en el puerto 8080
app.listen(8080);