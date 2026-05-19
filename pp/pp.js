//--------------------------- Carga de iconos y estadísticas al iniciar la página--------------------------------------

// Llamar a la función cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    cargarEstadisticas();
});


// Logica simple para cambiar de tabs
const tabs = document.querySelectorAll('.tab');
// Agregar evento de clic a cada tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`Cambiando a: ${tab.textContent.trim()}`);
    });
});

//-----------------navegación entre páginas----------------
// Seleccion el botón
const btnMangas = document.getElementById('btn-nav-mangas');

// Program la redirección
btnMangas.addEventListener('click', () => {
    window.location.href = '../catalogomangas/mangas.html';
});

const btnEditorial = document.getElementById('btn-nav-editorial')
btnEditorial.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../editorial/editorial.html';
});
const btnVenta = document.getElementById('btn-nav-ventas')
btnVenta.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../historialVentas/ventas.html';
});

//--------------------------- FunciOn para obtener las estadísticas desde el servidor
async function cargarEstadisticas() {
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/stats/diarias');
        const data = await respuesta.json();

        if (respuesta.ok) {
            // Actualiza los en HTML usando los IDs
            document.getElementById('ventas-hoy-count').textContent = data.ventas_dia;


            const elEfectivo = document.getElementById('efectivo-hoy');
            const elTarjeta = document.getElementById('tarjeta-hoy');
            const elTotal = document.getElementById('total-acumulado');


            if (elTotal) elTotal.textContent = `$${data.total_acumulado}`;
            if (elEfectivo) elEfectivo.textContent = `$${data.efectivo}`;
            if (elTarjeta) elTarjeta.textContent = `$${data.tarjeta}`;
        }

    } catch (error) {
        console.error("Error:", error);
    }
}
//--------------------------- MODAL DEL PROCESO DE VENTA--------------------------------------
// Obtener elementos
const modal = document.getElementById("modal-venta");
const btnAbrir = document.querySelector(".btn-nueva-venta");
const btnCerrar = document.querySelector(".close-modal");

// Abrir modal al dar click en el botn "Nueva Venta"
btnAbrir.addEventListener("click", () => {
    modal.style.display = "block";
    lucide.createIcons(); // Recargar iconos dentro del modal
});

// Cerrar modal al dar click en la X
btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Cerrar modal si se hace click fuera de la ventana blanca
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

//--------------------------- LOGICA DE BUSQUEDA DE MANGA Y CARGA DE PRODUCTOS--------------------------------------
const buscarManga = document.getElementById('search-manga')
const btnBuscarManga = document.getElementById('btn-search-manga')
const CampoNombre = document.getElementById('display-nombre');
const CampoPrecio = document.getElementById('display-precio');
const CampoStock = document.getElementById('display-stock');
const imagenManga = document.getElementById('imagen-manga');

async function buscarMangaPorNombre() {
    console.log('Buscando manga...');
    const nombreBusqueda = buscarManga.value.trim();
    console.log('Nombre ingresado:', nombreBusqueda);

    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/mangas/nombre/${nombreBusqueda}`);
        const manga = await respuesta.json();
        console.log('Respuesta del servidor:', manga);
        const rutaPortada = manga[0].url_imagen ? manga[0].url_imagen : 'img/default.png';


        if (Array.isArray(manga) && manga.length > 0) {
            CampoNombre.value = manga[0].titulo;
            console.log('Titulo del manga:', manga[0].titulo);
            CampoPrecio.value = `$${manga[0].precio}`;
            CampoStock.value = manga[0].stock;
            imagenManga.innerHTML = `<img src="../catalogomangas/${rutaPortada}" alt="${manga[0].titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;" onerror="this.src='../catalogomangas/img/default.png'">`;
        } else {
            imagenManga.innerHTML = `<img src="../catalogomangas/img/default.png" alt="Manga no encontrado" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;
            CampoNombre.value = "No encontrado";
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

            // - Evento para llenar los campos al hacer clic ---
            card.addEventListener('click', () => {
                //  Llenar Nombre del Producto (Título + Volumen)
                document.getElementById('display-nombre').value = `${m.titulo} `;

                //  Llenar Valor Ponderado (Precio)
                document.getElementById('display-precio').value = `$${m.precio.toFixed(2)}`;

                //  Llenar Stock Disponible
                document.getElementById('display-stock').value = m.stock;

                // Actualizar la imagen del placeholder 
                const previewImg = document.querySelector('.image-placeholder');
                previewImg.innerHTML = `<img src="../catalogomangas/${rutaPortada}" 
                                     style="width: 100%; height: 100%; object-fit: scale-down; "
                                     onerror="this.src='../catalogomangas/img/default.png'">`;

                // Resetear cantidad a 1 al seleccionar nuevo producto
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
// Evento para cargar mangas al hacer clic en el botón
VisualizarMangas.addEventListener('click', cargarMangas);

//funcion para incrementador
// Seleccionamos los elementos
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


//Agregar un manga al  wrapper desde una card y llenar los fields con los datos del manga seleccionado
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
//--------------------------- LOGICA DE LA TABLA DE VENTA, CALCULO DE TOTALES, IMPUESTOS Y DESCUENTOS--------------------------------------
//Funcion para calcular totales, impuestos y descuentos
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


    // Actualizar el HTML 
    document.querySelector('.totals-section p:nth-child(1) span').innerText = `$ ${subtotalFinal.toFixed(2)}`;
    document.querySelector('.totals-section p:nth-child(2) span').innerText = `$ ${impuesto.toFixed(2)}`;
    document.querySelector('.totals-section p:nth-child(3) span').innerText = `$ ${descuento.toFixed(2)}`;
    document.querySelector('.final-total span').innerText = `$ ${total.toFixed(2)}`;

    return { subtotal, impuesto, descuento, total };


}
// Función para agregar producto a la tabla
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
        wal.fire('Advertencia', 'Ingrese una cantidad valida', 'warning');
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
// Verificar si la cantidad total solicitada (en tabla + nueva) supera el stock
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

    const btnEliminar = fila.querySelector('.btn-eliminar-tabla');
    btnEliminar.addEventListener('click', () => {
        console.log(btnEliminar)
        fila.remove();

        calculoTotales();
    });

    tbody.appendChild(fila);
    calculoTotales();


}
matchProductos.addEventListener('click', cargarDatosTabla);

// Función para limpiar el formulario de búsqueda y el placeholder
function limpiarForm() {
    const buscarManga = document.getElementById('search-manga');
    const CampoNombre = document.getElementById('display-nombre');
    const CampoPrecio = document.getElementById('display-precio');
    const CampoStock = document.getElementById('display-stock');
    const imagenManga = document.getElementById('imagen-manga');


    buscarManga.innerHTML = "";
    imagenManga.innerHTML = `<i data-lucide="package-open"></i>`;
    lucide.createIcons(); // Esto busca nuevos elementos y los dibuja
    CampoNombre.value = "";
    CampoPrecio.value = "$0.00";
    CampoStock.value = "0";

}
// Función para limpiar la tabla de venta
const limpiar = document.getElementById('limpiar-tabla');
function limpiarTabla() {
    const tbody = document.getElementById('cart-items');
    tbody.innerHTML = '';
    calculoTotales();

}

limpiar.addEventListener('click', limpiarTabla);

// Función para cerrar el modal de pago
function cerrarModal() {

    const contenedor =
        document.getElementById('PantallaProceso');

    contenedor.style.display = 'none';

    contenedor.innerHTML = '';
}
// Función para procesar la venta
async function procesarVenta(metodoPago) {
    const filas = document.querySelectorAll('#cart-items tr');
    const productos = [];
    // Recolectar productos
    filas.forEach(fila => {
        productos.push({
            manga_id: parseInt(fila.cells[0].innerText),
            cantidad: parseInt(fila.cells[2].innerText)
        });
    });

    // Datos de venta
    const datosVenta = {
        productos: productos,
        metodo_pago: metodoPago
    };
    try {

        const response = await fetch('http://127.0.0.1:5000/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosVenta)
        });
        const resultado = await response.json();
        if (response.ok) {

            Swal.fire({
                title: 'Éxito',
                text: 'Pago procesado correctamente',
                icon: 'success'
            }).then(() => {

                cerrarModalPago();

            });
            // Limpiar tabla
            limpiarTabla();
            // Limpiar tabla
            limpiarForm();

        } else {
            Swal.fire('Error', `Error:${resultado.error}`, 'error');
        }

    } catch (error) {

        console.error("Error en la conexión:", error);

    }
}

//SECCION DE LOS CONTENEDORES PARA LOS PROCESOS DE TARJETA 
function cerrarModalPago() {

    const modal = document.getElementById('PantallaProceso');

    modal.style.display = 'none';
    modal.innerHTML = '';
}
// Función para mostrar el modal de pago según el método seleccionado
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

// Función para calcular el vuelto en efectivo
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


