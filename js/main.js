var productosElegidos = new Set(); //Necesitamos que sea un Set para que agreguen o quiten productos según el valor, y no según la posición como en los arrays.
var PRODUCTOS = [];
var contadorCarrito = 0;

$("h2").hide();
$("h3").hide();
$("#contenidoGenerado").hide();
$("#titulo2").hide();
$("#notificaciones").hide();

$("h2")
    .fadeIn(3500);
$("h3")
    .delay(1500)
    .slideDown(2000);

$(()=>{
$.getJSON("data/PRODUCTOS.json",(respuesta)=>{ //Obtenemos los datos desde un JSON en forma estática. Es una petición asíncrona.
        // GUARDAMOS LA RESPUESTA EN UNA VARIABLE EN EL LISTADO GLOBAL DE PRODUCTOS
        PRODUCTOS = respuesta;
        console.log(PRODUCTOS);

        //En esta sección generamos la salida de los productos en pantalla, en formatos filas y columnas.
        if (PRODUCTOS.length % 3 > 0){
            cantidadFilas = parseInt((PRODUCTOS.length/3)) + 1; // NECESITAMOS PARSEAR PARA QUE SEA UNA DIVISION ENTERA Y SUMARLE 1.
            //ESTO ES PORQUE QUIERO QUE LOS PRODUCTOS SALGAN DE A 3 POR FILA. SI SON 7 PRODUCTOS, SERAN 3 FILAS:
            // 1 fila x 3 prod, 1 fila x 3 prod, 1 fila x 1 producto.
        } else {
            cantidadFilas = PRODUCTOS.length / 3;
        }
        let cantidadColumnas = 3;
        let contadorProductos = 0;

        //GENERACION DEL CONTENIDO
        for (i=0; i<cantidadFilas; i++){
            $("#contenidoGenerado").append(`<div class="row" id="fila${i+1}"></div>`);
            for (j=0; j<cantidadColumnas; j++){
                if (contadorProductos == (PRODUCTOS.length)) {break;} //Cuando la variable contador sea igual al largo del array, para for para que no lance error.
                $(`#fila${i+1}`).append(crearComponente(PRODUCTOS[contadorProductos]));
                contadorProductos +=1;
            }
        }

        generacionEscuchas(); //generacionEscuchas() debe estar antes de la llave porque sino itera, y genera muchas escuchas.
        $("#contenidoGenerado")
            .delay(3000)
            .toggle("slow");
        $("#titulo2").
            delay(3000).
            fadeIn("slow");
    })
})

//console.log(PRODUCTOS); //UNA VEZ QUE SE SALE DEL GETJSON SE PIERDEN LOS VALORES DEL ARRAY


//Hay que poner la escucha una vez que fue creado el botón
function generacionEscuchas(){
$('button[id^="botonAgregar"]').click((e) =>{ //Escuchamos los botones que contenga en su id "Agregar"
    let idProducto = parseInt(e.target.id.substr(12)); //le sacamos los primeros 12 caracteres que corresponden a "botonAgregar"
    productosElegidos.add(PRODUCTOS[idProducto-1]);
    agregarCarrito();
    anularBotonAgregar(idProducto);
    habilitarBotonRemover(idProducto);
    console.log(productosElegidos + " " + contadorCarrito); //Verificamos que sea correcta la lista.
    $("#notificaciones").html(`Seleccionaste el producto: ${PRODUCTOS[idProducto-1].descripcion}`)
    $("#notificaciones").toggle(500).delay(1000).toggle(500);
    if (productosElegidos.size =!0 && contadorCarrito ==0){
        $("#carrito").toggle(1000);
        contadorCarrito +=1;
    }
})

$('button[id^="botonRemover"]').click((e)=>{ //Escuchamos los botones cuyo Id contenga "Remover"
    let idProducto = parseInt (e.target.id.substr(12));
    productosElegidos.delete(PRODUCTOS[idProducto-1]); //eliminamos el elemento del set con los valores especificos del array Producto en la posicion especificada.
    removerCarrito(PRODUCTOS[idProducto-1].descripcion);
    habilitarBotonAgregar(idProducto);
    anularBotonRemover(idProducto);
    console.log(productosElegidos); //Verificamos que sea correcta la lista.
    $("#notificaciones").html(`Deseleccionaste el producto: ${PRODUCTOS[idProducto-1].descripcion}`);
    $("#notificaciones").toggle(500).delay(1000).toggle(500);
    if (productosElegidos.size == 0){
        $("#carrito").toggle(1000);
        contadorCarrito = 0;
    }
})

$('#enviarPost').click((e)=>{
    $("#contenidoPost h6").remove();
    productosElegidos.forEach(producto => enviarPost(producto));
    $("contenidoPost").fadeIn(3000).fadeOut(3000);
})
}

//Se crea un componente producto en formato de template de caracteres, con la información del objeto producto que se le pasa por parámetro. 
function crearComponente (producto){
    return `<div id="${producto.descripcion.toLowerCase()}" class="column" style="text-align:center;">
                <img src="${producto.imagen}" id="imagen${producto.id}" style="width: 150px; height: 250px;">
                <div class="container">
                    <h4>${producto.descripcion}</h4>
                    <h4>Precio: $${producto.precio}</h4>
                    <button id="botonAgregar${producto.id}">AGREGAR</button>
                    <button id="botonRemover${producto.id}" style="display:none;">REMOVER</button>
                </div>
            </div>`;
}


function habilitarBotonAgregar (id){
    $(`#botonAgregar${id}`).fadeIn(600);
    //console.log("Se habilitó el boton Agregar");
}

function anularBotonAgregar (id){
    $(`#botonAgregar${id}`).fadeOut(600);
    //console.log("Se inhabilitó el boton Agregar");

}

function habilitarBotonRemover (id){
    $(`#botonRemover${id}`).fadeIn(600);
    //console.log("Se habilitó el boton Remover");
}

function anularBotonRemover (id){
    $(`#botonRemover${id}`).fadeOut(600);
    //console.log("Se inhabilitó el boton Remover");
}

function enviarPost(producto){
    $.post("https://jsonplaceholder.typicode.com/posts", producto, (data, status)=>{
        // SI LA PETICION SE CUMPLE
        if(status === "success"){
          // CARGAMOS EN EL DOM LA RESPUESTA (QUE ESTARIA EN LA VARIABLE DATA) A LA PETICIÓN POST. 
          // EN ESTE CASO JSONPLACEHOLDER CAMBIAR ID A 101.
          $("#contenidoPost").append(`<h6>ID - ${data.id} - descripcion: ${data.descripcion} - precio: ${data.precio} </h6>`);
        }
    })
}

function agregarCarrito(){
    let contenidoGenerado = `<h3> Carrito   
                             <img class="carritoSVG" src="img/carrito.svg">
                             </h3>`;
    let precioTotal = 0;
    let id = 1;
    for (producto of productosElegidos){
        contenidoGenerado += `<h5 id="${producto.descripcion}">${id}) ${producto.descripcion}, $${producto.precio}</h5>`;
        precioTotal += producto.precio;
        id ++;
    }
    contenidoGenerado += `<h5 style="font-weight:900;"> Total: $${precioTotal} </h5>
                          <button id="Confirmar compra">Confirmar compra</button>`;
    $("#carrito").html(contenidoGenerado);
}

function removerCarrito(id){
    console.log (id);
    $(`#${id}`).remove();
    let contenidoGenerado = `<h3> Carrito  
                             <img class= "carritoSVG" src="img/carrito.svg">
                             </h3>`;
    let precioTotal = 0;
    let numero = 1;
    for (producto of productosElegidos){
        contenidoGenerado += `<h5 id="${producto.descripcion}">${numero}) ${producto.descripcion}, $${producto.precio}</h5>`;
        precioTotal += producto.precio;
        numero ++;
    }
    contenidoGenerado += `<h5 style="font-weight:900;"> Total: $${precioTotal} </h5>
                          <button id="Confirmar compra">Confirmar compra</button>`;
    $("#carrito").html(contenidoGenerado);
}
