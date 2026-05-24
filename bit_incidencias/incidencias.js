//SECCION DE NAV BAR E ICONOS
// Inicializar iconos de Lucide
lucide.createIcons();

// Lgica simple para cambiar de tabs
const tabs = document.querySelectorAll('.tab');
// Agregar evento de clic a cada tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`Cambiando a: ${tab.textContent.trim()}`);
    });
});

const btnInicio = document.getElementById('pp-nav');
btnInicio.addEventListener('click', () => {
    // Salimos de /bitincidencias/ y entramos a /pp/
    window.location.href = '../pp/pp.html';
});

const btnMangas = document.getElementById('btn-nav-materiales');
btnMangas.addEventListener('click', () => {
    // Salimos de /bitincidencias/ y entramos a /catalogomateriales/
    window.location.href = '../catalogomateriales/materiales.html';
});

const btnEditorial = document.getElementById('btn-nav-bitacora')

btnEditorial.addEventListener('click', () => {
    // Salimos de /bitincidencias/ y entramos a bitacora  de materiales
    window.location.href = '../bit_materiales/bitacora.html';
});


//-------------------------SECCION DESTINADA A OBTENER LAS INCIDENCIAS-----------------------------------------------------------------------------------


/*Funcion correspondiente al mapeo de las incidencias , aqui se encuentra el card que se genera dinamicamente con la disposcion adecuada
para mostrar en el formato incial datos :  num incidencia , total ,fecha y metodo de pago*/

/*NOTA : Tiene un paramatro puesto que mas abajo hay dos metodos uno para cargar todas las incidencias que utiliza el edpoint
de get y otro que se trata de un metodo filtro para buscar una incidencia especifica por id*/
function mapearIncidencias(incidencias) {

    const contenedor = document.getElementById('contenedor-incidencias');
    contenedor.innerHTML = '';



    if (!incidencias) return;
    // SI ES UNA SOLA VENTA
    //Valida que sea una array lo que le esta pasando
    const listaIncidencias = Array.isArray(incidencias)
        ? incidencias
        : [incidencias];

    listaIncidencias.forEach(incidencia => {
        const card = document.createElement('div');
        card.className = 'incidencia-card';


        //Card
        card.innerHTML = `

           
            <!-- BOTÓN ACTUALIZAR -->
            <button 
                class="btn-actualizar"
                title="Actualizar Incidencia">
                <i data-lucide="pencil"></i>
            </button>
             <!-- BOTÓN ELIMINAR -->
            <button 
                class="btn-eliminar"
                title="Eliminar Incidencia">
                <i data-lucide="trash-2"></i>
            </button>
            <div class="incidencia-header">
                <div>
                    <h3>Registro #${incidencia.id_bitacora}</h3>
                    <p>${incidencia.fecha}</p>
                </div>
                <div class="incidencia-descripcion">
                    ${incidencia.tipo}
                </div>
            </div>
            <div class="incidencia-body">
               
            </div>
            <button class="btn-leer-mas">
                Ver detalles
            </button>
            <div class="detalles">
                <ul>
                   <li class="bitacora-item">
                <div>
                    <strong>#${incidencia.id_material + ' - ' + incidencia.nombre_material}</strong>
                </div>
                <div class="bitacora-info">
                     <span>Descripción: ${incidencia.descripcion}</span>
                     <span>Cantidad: ${incidencia.cantidad}</span>
                     <span>Exp. Maestro: ${incidencia.exp_maestro}</span>
                     <span>Exp. Alumno: ${incidencia.exp_alumno}</span>
                     
                </div>
            </li>
                </ul>
            </div>
        `;

        // BOTÓN VER DETALLES
        //Boton para ver los detalles que son la lista antes mencionada con los mangas que llevo el client
        const botonDetalles = card.querySelector('.btn-leer-mas');
        const detalles = card.querySelector('.detalles');

        botonDetalles.addEventListener('click', () => {
            detalles.classList.toggle('mostrar');
            botonDetalles.textContent =
                detalles.classList.contains('mostrar')
                    ? 'Ocultar detalles'
                    : 'Ver detalles';
        });

        // BOTÓN ELIMINAR
        //Boton para eliminar la venta 
        const btnEliminar = card.querySelector('.btn-eliminar');

        btnEliminar.addEventListener('click', () => {
            eliminarIncidencia(incidencia.Id_bitacora);
        });

        // BOTÓN ACTUALIZAR
        //Boton para actualizar la venta
        const btnActualizar = card.querySelector('.btn-actualizar');
        btnActualizar.addEventListener('click', () => {
            actualizarIncidencia(incidencia);
        });
        contenedor.appendChild(card);
    });
    // ACTIVAR ICONOS LUCIDE
    lucide.createIcons();
}
async function cargarIncidencias() {
    try {
        const respuesta = await fetch('http://localhost:5000/api/bitacora/incidencias/laboratorio/1');
        const incidencias = await respuesta.json();
        mapearIncidencias(incidencias);
        console.log(incidencias);
    } catch (error) {
        console.error("Error al obtener las incidencias:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarIncidencias();
});


//Metodo para hacer la busqueda de las incidencias por id
async function buscarIncidencias() {
    const tipoFiltro =//De un seleccion obtiene la opcion , en este caso solo es id
        document.getElementById('tipo-filtro').value;
    const valor =
        document.getElementById('input-busqueda')
            .value
            .trim();//Obtiene el valor que se ingreso en el input

    if (valor === '') {//Cuando el input esta vacion se van a cargar todas las ventas que haya en la bd
        cargarIncidencias();
        return;
    }
    let url = '';
    switch (tipoFiltro) {
        case 'id':
            const valorBusqueda = parseInt(valor);
            console.log(valorBusqueda)
            url = `http://127.0.0.1:5000/incidencias/${valorBusqueda}`;
            //En este segun lo que el cliente ingreso en el input lo coloca para mandar llamar el edpoint
            break;
    }
    try {
        const respuesta = await fetch(url);//pide la informacion al servidor
        if (!respuesta.ok) {//si el servidor no obtiene nada va colocar un mensaje en la pantalla de que el id no fue encontrado

            const contenedor =
                document.getElementById('contenedor-incidencias');

            contenedor.innerHTML = `
                <p class="mensaje-error">
                    No se encontró ninguna incidencia con ese ID
                </p>
            `;

            return;
        }
        const incidencias = await respuesta.json();//Si obtiene la informacion correctamente

        mapearIncidencias(incidencias)//Mandara llamar el metodo para que mapee la incidencia encontrada

    } catch (error) {
        console.error("Error en búsqueda:", error);
    }
}


const search = document.getElementById('btn-buscar-filtro');
search.addEventListener('click', () => {//Boton que al clickear ejecuta el evento para que se busque la venta
    buscarIncidencias();
});


//FUNCION PARA CREAR DINAMICAMENTE Y CARGAR EL FORM DE ELIMINA
async function eliminarIncidencia(id) {//Metodo para eliminar una incidencia desde un boton que se encuentra en las cards
    const result = await Swal.fire({//Formato para avisar al usuario si esta seguro de eliminar la incidencia
        title: '¿Seguro que quieres eliminar esta incidencia?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        width: '280px',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#b0123f',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#855597'
    });

    if (result.isConfirmed) {//Si es correctp

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/incidencias/${id}`,//Hace la solicitus por medio del edpoint de eliminar incidencia
                {
                    method: 'DELETE'//En el metodo de delete
                }
            );
            if (response.ok) {//Si la operacion se realizo con exito 
                await Swal.fire({//Devuelve una alerta de que la incidencia se borro correctamente
                    title: '¡Incidencia eliminada!',
                    text: 'La incidencia se eliminó correctamente',
                    icon: 'success',
                    width: '280px',

                    confirmButtonText: 'OK',
                    confirmButtonColor: '#855597'
                });
                location.reload();//Recarga la pagina
            } else {//Si no es exitoso devuelce una alerta avisando al usuario que no se pude eliminar la incidencia
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la incidencia',
                    icon: 'error',
                    width: '280px',

                    confirmButtonText: 'OK',
                    confirmButtonColor: '#855597'
                });
            }
        } catch (error) {

            console.error('Error al eliminar incidencia:', error);

            await Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al eliminar la incidencia',
                icon: 'error',
                width: '280px',
                confirmButtonText: 'OK',
                confirmButtonColor: '#855597'
            });
        }
    } else {
        await Swal.fire({
            title: 'Cancelado',
            text: 'La incidencia no fue eliminada',
            icon: 'info',
            width: '280px',
            confirmButtonText: 'OK',
            confirmButtonColor: '#855597'
        });
    }
}

/*------SECCION DESTINANDA A LO RELACIONADO CON EL MODAL DE ACTUALIZAR VENTA-----------------------------*/
const buscarManga = document.getElementById('search-incidencia');
const btnBuscarManga = document.getElementById('btn-search-incidencia');
const CampoNombre = document.getElementById('display-nombre');
const CampoPrecio = document.getElementById('display-precio');
const CampoStock = document.getElementById('display-stock');
const imagenManga = document.getElementById('imagen-incidencia');

async function buscarMangaPorNombre() {//Funcion para buscar manga por nombre 
    console.log('Buscando manga...');
    const nombreBusqueda = buscarManga.value.trim();//obtiene el valor del input asociado a ese id y le quita los espacios
    console.log('Nombre ingresado:', nombreBusqueda);

    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/mangas/${nombreBusqueda}`);//Hace la peticion a la api
        const manga = await respuesta.json();
        console.log('Respuesta del servidor:', manga);
        const rutaPortada = manga[0].url_imagen ? manga[0].url_imagen : 'img/default.png';//ruta de la portada del manga por default


        if (Array.isArray(manga) && manga.length > 0) {
            CampoNombre.value = manga[0].titulo;//Asigna el valor del titulo del manga que esta trayendo de la base de datos al input asociado al id del campo nombre
            console.log('Titulo del manga:', manga[0].titulo);
            CampoPrecio.value = `$${manga[0].precio}`;//Asigna el precio
            CampoStock.value = manga[0].stock;//Asigna el stock
            imagenManga.innerHTML = `<img src="../catalogomangas/${rutaPortada}" alt="${manga[0].titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;" onerror="this.src='../catalogomangas/img/default.png'">`;
            //Asigna la portada de la imagen
        } else {
            //En caso de que no encuentre el manga va dejar los valores de los campos con algo distinto
            imagenManga.innerHTML = `<img src="../catalogomangas/img/default.png" alt="Manga no encontrado" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;//Asigna una imagen por default al no encontrar el manga
            CampoNombre.value = "No encontrado";//Asigna "no encontrado" al input de titulo
            //Deja en 0 tanto el precio como el stock
            CampoPrecio.value = "$0.00";
            CampoStock.value = "0";
        }
        return manga;


    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

// Evento para presionar Enter
//al detectar el evento realiza la busqueda del manga por medio del nombre
buscarManga.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarMangaPorNombre();
    }
});

// Evento para clic en la lupa
btnBuscarManga.addEventListener('click', buscarMangaPorNombre);


//funcion para cargar los mangas al darle visualizar productos
const VisualizarMangas = document.getElementById('btn-visualizar-mangas');

async function cargarMangas() {
    try {
        // Llamada al endpoint que ya incluye el LEFT JOIN con manga_imagenes
        const response = await fetch('http://127.0.0.1:5000/mangas');
        const mangas = await response.json();

        const container = document.getElementById('mangas-list-container');

        // Generar las tarjetas dinámicamente
        mangas.forEach(m => {
            const card = document.createElement('div');
            card.className = 'manga-card';

            //si la BD no tiene url_imagen, usa una por defecto
            const rutaPortada = m.url_imagen ? m.url_imagen : 'img/default.png';


            // Construir el HTML de la tarjeta con los datos del manga
            card.innerHTML = `
                <div class="card-top">
                    <span class="id-badge">${m.id}</span>   
                    <span class="editorial-label">Editorial ${m.id_editorial}</span>
                    <img src="../catalogomangas/${rutaPortada}" 
                         class="mangacard-img" 
                         alt="Portada de ${m.titulo}"
                         onerror="this.src='../catalogomangas/img/default.png'">
                    <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s  </span>

                </div>
                <div class="manga-info">
                    <h3>${m.titulo} </h3>
                    <p>${m.autor}</p>
                    <div class="price-tag">
                        <i data-lucide="dollar-sign"></i>
                        <span>$${m.precio.toFixed(2)}</span>
                    </div>
                </div>
            `;

            // --- NUEVO: Evento para llenar los campos al hacer clic ---
            card.addEventListener('click', () => {
                //  Llenar Nombre del Producto (Título + Volumen)
                document.getElementById('display-nombre').value = `${m.titulo} `;

                //  Llenar Valor Ponderado (Precio)
                document.getElementById('display-precio').value = `$${m.precio.toFixed(2)}`;

                //  Llenar Stock Disponible
                document.getElementById('display-stock').value = m.stock;

                //  Actualizar la imagen del placeholder 
                const previewImg = document.querySelector('.image-placeholder');
                previewImg.innerHTML = `<img src="../catalogomangas/${rutaPortada}" 
                                     style="width: 100%; height: 100%; object-fit: scale-down; "
                                     onerror="this.src='../catalogomangas/img/default.png'">`;

                // 5. Resetear cantidad a 1 al seleccionar nuevo producto
                document.getElementById('display-cantidad').value = 1;
            });
            container.appendChild(card);
        });

        // Refrescar iconos para las nuevas tarjetas inyectadas
        lucide.createIcons();

    } catch (error) {
        console.error("Error al conectar con la API de MangaStore:", error);
    }
}
VisualizarMangas.addEventListener('click', cargarMangas);


const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const inputCantidad = document.getElementById('display-cantidad');

// Evento para aumentar
btnPlus.addEventListener('click', () => {
    let valorActual = parseInt(inputCantidad.value);
    inputCantidad.value = valorActual + 1;
});

// Evento para disminuir
btnMinus.addEventListener('click', () => {
    let valorActual = parseInt(inputCantidad.value);
    // Evitamos que sea menor a 1
    if (valorActual > 1) {
        inputCantidad.value = valorActual - 1;
    }
});


//SECCION DE LA LOGICA PARA EL FUNCIONAMIENTO DEL MODAL 
//Obetener el id
async function obtenerId(nombre) {
    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/mangas/${nombre}`);
        if (!respuesta.ok) {
            console.log('Manga no encontrado');
            return null;
        }
        const manga = await respuesta.json();
        if (Array.isArray(manga) && manga.length > 0) {
            console.log('ID del primer manga:', manga[0].id);
            return manga[0].id;
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }

}
//Funcion para calcular los totales de la venta , se llama cada que se agrega un producto a la tabla o se elimina
function calculoTotales() {
    console.log('Holi');
    const filas = document.querySelectorAll('#cart-items tr');
    let subtotal = 0;

    filas.forEach(fila => {
        // Obtenemos precio y cantidad de las celdas (ajusta el índice si es necesario)
        const cantidad = parseFloat(fila.cells[2].innerText) || 0;
        const precioText = fila.cells[3].innerText;
        const precio = parseFloat(
            precioText.replace('$', '').trim()
        ) || 0;
        subtotal += cantidad * precio;
        console.log(cantidad, precio);
    });



    const impuestoReal = subtotal * 0.16;
    const impuesto = impuestoReal; // Ejemplo 16%
    const subtotalFinal = subtotal - impuestoReal;
    const descuento = subtotal > 1000 ? 50 : 0; // Ejemplo: $50 si es > 1000
    const total = subtotal - descuento;


    // Actualizar el HTML que pasaste
    document.querySelector('.totals-section p:nth-child(1) span').innerText = `$ ${subtotalFinal.toFixed(2)}`;
    document.querySelector('.totals-section p:nth-child(2) span').innerText = `$ ${impuesto.toFixed(2)}`;
    document.querySelector('.totals-section p:nth-child(3) span').innerText = `$ ${descuento.toFixed(2)}`;
    document.querySelector('.final-total span').innerText = `$ ${total.toFixed(2)}`;

    return { subtotal, impuesto, descuento, total };


}
//Funcion para cargar los datos del producto a la tabla del carrito cada que se le da click al boton de agregar producto
const matchProductos = document.getElementById('btn-agregar-producto');
async function cargarDatosTabla() {
    console.log('Agregando producto a la tabla...');
    const nombre = document.getElementById('display-nombre').value.trim();
    const id = await obtenerId(nombre);
    const precio = document.getElementById('display-precio').value;
    const cantidad = parseInt(
        document.getElementById('display-cantidad').value
    );
    const stock = parseInt(
        document.getElementById('display-stock').value
    );

    const tbody = document.getElementById('cart-items');
    if (!id) {
        Swal.fire('Advertencia', 'Debe seleccionar un producto', 'warning');
        return;
    }
    if (!cantidad || cantidad <= 0) {
        Swal.fire('Advertencia', 'Ingrese una cantidad valida', 'warning');
        return;
    }

    if (cantidad > stock) {
        Swal.fire('Error', 'No hay stock suficiente', 'error');
        return;
    }

    let cantidadEnTabla = 0;

    const filas = document.querySelectorAll('#cart-items tr');

    filas.forEach(fila => {

        const idTabla = parseInt(fila.cells[0].innerText);

        const cantidadTabla = parseInt(fila.cells[2].innerText);

        // Si es el mismo manga
        if (idTabla === id) {
            cantidadEnTabla += cantidadTabla;
        }

    });

    const totalSolicitado = cantidadEnTabla + cantidad;

    if (totalSolicitado > stock) {

        Swal.fire('Error', `Stock insuficiente. Disponible: ${stock - cantidadEnTabla}`, 'error');

        return;
    }
    const bloque = {
        id, nombre, cantidad, precio
    }
    console.log(bloque);
    const fila = document.createElement('tr');

    fila.innerHTML = `
        <td>${bloque.id}</td>
        <td>${bloque.nombre}</td>
        <td>${bloque.cantidad}</td>
        <td>${bloque.precio}</td>
        <td>
              <span class="btn-eliminar-tabla">&times;</span>
        </td>

    `;
//Evento para eliminar la fila del producto agregado a la tabla del carrito
    const btnEliminar = fila.querySelector('.btn-eliminar-tabla');
    btnEliminar.addEventListener('click', () => {
        console.log(btnEliminar)
        fila.remove();

        calculoTotales();
    });

    tbody.appendChild(fila);
    calculoTotales();


}
//Evento para cargar los datos del producto a la tabla del carrito cada que se le da click al boton de agregar producto
matchProductos.addEventListener('click', cargarDatosTabla);

//Funcion para limpiar el formulario cada que se le da click al boton de limpiar formulario
function limpiarForm() {
    const buscarManga = document.getElementById('search-incidencia');
    const CampoNombre = document.getElementById('display-nombre');
    const CampoPrecio = document.getElementById('display-precio');
    const CampoStock = document.getElementById('display-stock');
    const imagenManga = document.getElementById('imagen-incidencia');


    buscarManga.innerHTML = "";
    imagenManga.innerHTML = `<i data-lucide="package-open"></i>`;
    lucide.createIcons(); // Esto busca nuevos elementos y los dibuja
    CampoNombre.value = "";
    CampoPrecio.value = "$0.00";
    CampoStock.value = "0";

}
//Evento para limpiar el formulario cada que se le da click al boton de limpiar formulario
const limpiar = document.getElementById('limpiar-tabla');
function limpiarTabla() {
    const tbody = document.getElementById('cart-items');
    tbody.innerHTML = '';
    calculoTotales();

}
//Evento para limpiar el formulario cada que se le da click al boton de limpiar formulario
limpiar.addEventListener('click', limpiarTabla);

//-------------------------------PROCESO DE VENTA
//SECCION DE LOS CONTENEDORES PARA LOS PROCESOS DE TARJETA 
//Cierra el modal de donde se encuentra el pago
function cerrarModalPago() {
    const modal = document.getElementById('PantallaProceso');
    modal.style.display = 'none';
    modal.innerHTML = '';
}
//Funcion para mostrar el modal de proceso de pago dependiendo del metodo que se seleccione , ya sea efectivo o tarjeta
function cardsEfectivoTarjeta(metodo) {
    const filas = document.querySelectorAll('#cart-items tr');

    if (filas.length === 0) {
        Swal.fire('Advertencia', 'Debe agregar productos al carrito', 'warning');
        return;
    }
    const contenedor = document.getElementById('PantallaProceso');

    const totalTexto = document.querySelector('.final-total span')
        .innerText;

    const total = parseFloat(
        totalTexto.replace('$', '').trim()
    );
    //SECCION DE TARJETA EN LOS FORMS
    if (metodo == 'Tarjeta') {
        contenedor.style.display = "flex";
        contenedor.innerHTML = `
            <div class="modal-pago animate-pop">
                <span class="btn-cerrar">&times;</span>
                <h3>Procesando Tarjeta</h3>
                <div class="total-pago">
                    <span>Total a pagar</span>
                    <h2>$${total.toFixed(2)}</h2>
                </div>
                <button type="submit" id="tarjeta-proceso">
                    Procesar Tarjeta
                </button>

            </div>
        `;
        const btnCerrar = contenedor.querySelector('.btn-cerrar');
        btnCerrar.addEventListener('click', () => {
            contenedor.style.display = "none";
        });

        const procesoCard = document.getElementById('tarjeta-proceso');
        procesoCard.addEventListener('click', () => {
            procesarVenta('Tarjeta');
        });
        //SECCION DE EFECTIVO EN LOS FORMS 
    } else if (metodo == 'Efectivo') {
        console.log('2');
        contenedor.style.display = "flex";
        contenedor.innerHTML = `
            <div class = "modal-pago animate-pop">
                <span class="btn-cerrar">&times;</span>
                <h3>Efectivo:</h3>'
                <p>Total: $${total.toFixed(2)}</p>
                <label>Ingrese el monto:</label>
                <input type="number" id="efectivo">

                <button id="btn-calcular" type="submit">
                    Calcular Cambio
                </button>
                <div id = "Cambio">

                </div>
            </div>
        `;

        const btnCerrar = contenedor.querySelector('.btn-cerrar');
        btnCerrar.addEventListener('click', () => {
            contenedor.style.display = "none";
        });
        const procesoCash = document.getElementById('btn-calcular');
        procesoCash.addEventListener('click', () => {
            // console.log('Tarjeta')
            vuelto(total);
        });

    }
}

//CALCULAR EL VUELTO EN CASO DE QUE EL METODO DE PAGO SEA EFECTIVO
function vuelto(total) {
    const efectivo1 = document.getElementById('efectivo');
    const efectivo = parseInt(efectivo1.value);

    const vueltoDiv = document.getElementById('Cambio');
    if (!efectivo || efectivo <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Debe ingresar una cantidad válida',
            icon: 'error',
            zIndex: 99999
        });
        return;
    }
    if (efectivo < total) {
        vueltoDiv.innerHTML = `<p>Falta efectivo</p>`;

        return;
    }
    const calcVuelto = efectivo - total;
    vueltoDiv.innerHTML = `
        <p>Su cambio es: $${calcVuelto.toFixed(2)}</p>
        <button id= "finalizarProp" type="submit">Procesar Pago</button>
    `;
    const cashFinal = document.getElementById('finalizarProp');
    cashFinal.addEventListener('click', () => {
        procesarVenta('Efectivo');
    });

}

//Funcion para cargar los datos de la venta al modal de actualizar venta cada que se le da click al boton de actualizar venta
async function actualizarVenta(venta) {
    const modal = document.getElementById('modal-incidencias');
    modal.style.display = 'flex';

    const tbody = document.getElementById('cart-items');
    tbody.innerHTML = '';

    // Usamos map para crear una lista de promesas de búsqueda
    const promesasArticulos = venta.articulos.map(async (art) => {
        // Si el artículo no tiene ID, lo buscamos por nombre
        let idReal = art.manga_id;

        if (!idReal) {
            console.log(`Buscando ID para: ${art.manga}`);
            idReal = await obtenerId(art.manga);
        }

        return {
            ...art,
            manga_id: idReal || 'S/N' // Asignamos el ID obtenido o S/N
        };
    });

    // Esperamos a que todas las búsquedas terminen
    const articulosConId = await Promise.all(promesasArticulos);

    // Ahora mapeamos en la tabla
    articulosConId.forEach(art => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${art.manga_id}</td>
            <td>${art.manga}</td>
            <td>${art.cantidad}</td>
            <td>$${art.precio_unitario}</td>
            <td>
                <span class="btn-eliminar-tabla">&times;</span>
            </td>
        `;

        fila.querySelector('.btn-eliminar-tabla').addEventListener('click', () => {
            fila.remove();
            calculoTotales();
        });

        tbody.appendChild(fila);
    });

    calculoTotales();
    modal.dataset.ventaId = venta.id_venta;
    modal.dataset.modo = 'update';
}
//Funcion para procesar el pago de la venta , se llama cada que se le da click al boton de procesar pago en el modal de proceso de pago
async function procesarVenta(metodoPago) {
    const modal = document.getElementById('modal-incidencias');
    const id = modal?.dataset?.ventaId;
    const filas = document.querySelectorAll('#cart-items tr');
    if (filas.length === 0) {
        Swal.fire('Error', 'No hay productos en la venta', 'error');
        return;
    }
    const productos = [];
    filas.forEach(fila => {
        const manga_id = parseInt(fila.cells[0].innerText);
        const cantidad = parseInt(fila.cells[2].innerText);
        if (!manga_id || !cantidad) return;
        productos.push({ manga_id, cantidad });
    });

    if (productos.length === 0) {
        Swal.fire('Error', 'Productos inválidos', 'error');
        return;
    }

    const datos = {
        productos,
        metodo_pago: metodoPago
    };

    try {
        const res = await fetch(`http://127.0.0.1:5000/ventas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            Swal.fire('Error', data.error || 'Error al actualizar venta', 'error');
            return;
        }
        await Swal.fire({
            title: 'Éxito',
            text: 'Pago procesado correctamente',
            icon: 'success'
        });
        // Limpieza
        cerrarModalPago();
        limpiarTabla();
        limpiarForm();
        location.reload();

    } catch (error) {
        console.error("Error PUT venta:", error);
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    }
}
//Funcion para limpiar el modal de actualizar venta cada que se le da click al boton de cerrar modal o al finalizar la venta
function limpiarVentaModal() {
    // Inputs de búsqueda y producto
    document.getElementById('search-incidencia').value = '';
    document.getElementById('display-nombre').value = '';
    document.getElementById('display-cantidad').value = 1;

    // Imagen del producto
    const imagen = document.getElementById('imagen-incidencia');
    imagen.innerHTML = '<i data-lucide="package-open"></i>';

    // Carrito
    document.getElementById('cart-items').innerHTML = '';

    // Totales (reinicio visual)
    document.querySelector('.totals-section').innerHTML = `
        <p>SUBTOTAL <span>$ 00.00</span></p>
        <p>IMPUESTO <span>$ 00.00</span></p>
        <p>DESCUENTO <span>$ 00.00</span></p>
        <h3 class="final-total">TOTAL <span>$ 00.00</span></h3>
    `;
}
const modal = document.getElementById("modal-incidencias");
const btnCerrar = document.querySelector(".close-modal");
//Evento para cerrar el modal de actualizar incidencia cada que se le da click al boton de cerrar modal o al finalizar la incidencia
btnCerrar.addEventListener("click", async () => {

    const result = await Swal.fire({
        title: '¿Cerrar incidencia?',
        text: 'Se perderán los datos actuales',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#855597',
        cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        modal.style.display = "none";
        limpiarVentaModal();
    }
});


