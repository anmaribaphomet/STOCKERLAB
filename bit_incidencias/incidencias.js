//-----------------------------------------SECCION DE NAV BAR E ICONOS
// Inicializar la carga de las incidencias al cargar la pagina y activar los iconos de lucide
document.addEventListener('DOMContentLoaded', () => {
    cargarIncidencias();
    lucide.createIcons();
});

// Animacion del cambio de pestañas(tabs del navbar)
const tabs = document.querySelectorAll('.tab');
// Agregar evento de clic a cada tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`Cambiando a: ${tab.textContent.trim()}`);
    });
});
//----- Funcionalidad de navegación
//a inicio
const btnInicio = document.getElementById('pp-nav');
btnInicio.addEventListener('click', () => {
    // Salimos de /bitincidencias/ y entramos a /pp/
    window.location.href = '../pp/pp.html';
});
//a materiales
const btnMateriales = document.getElementById('btn-nav-materiales');
btnMateriales.addEventListener('click', () => {
    // Salimos de /bitincidencias/ y entramos a /catalogomateriales/
    window.location.href = '../catalogomateriales/materiales.html';
});
//a bitacora de materiales
const btnbit_materiales = document.getElementById('btn-nav-bitacora')

btnbit_materiales.addEventListener('click', () => {
    // Salimos de /bitincidencias/ y entramos a bitacora  de materiales
    window.location.href = '../bit_materiales/bitacora.html';
});


//-------------------------SECCION DESTINADA A OBTENER LAS INCIDENCIAS-----------------------------------------------------------------------------------

//Funcion para mapear las incidencias obtenidas de la base de datos y mostrarlas en la pantalla en tarjetas dinamicas
function mapearIncidencias(incidencias) {

    const contenedor = document.getElementById('contenedor-incidencias');
    contenedor.innerHTML = '';



    if (!incidencias) return;
    // SI ES UNA SOLA INCIDENCIA LA CONVIERTE EN UN
    // ARRAY PARA QUE EL MAPEO FUNCIONE CORRECTAMENTE, SI YA ES UN ARRAY SIMPLEMENTE LO USA COMO ESTA
    //Valida que sea una array lo que le esta pasando
    const listaIncidencias = Array.isArray(incidencias)
        ? incidencias
        : [incidencias];//Si no es un array lo convierte en un array con un solo elemento que es la incidencia obtenida

    listaIncidencias.forEach(incidencia => {//Por cada incidencia obtenida de la base de datos se crea una card dinamica con la informacion de la incidencia
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
        //Boton para ver los detalles del registro de la incidencia, al dar click se despliega una seccion con la informacion detallada 
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
        const btnEliminar = card.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => {
            eliminarIncidencia(incidencia.Id_bitacora);//Al dar click en el boton eliminar se ejecuta la funcion eliminarIncidencia que se encuentra mas abajo y se le pasa el id de la incidencia para eliminarla
        });

        // BOTÓN ACTUALIZAR
        const btnActualizar = card.querySelector('.btn-actualizar');
        btnActualizar.addEventListener('click', () => {
            actualizarIncidencia(incidencia);//Al dar click en el boton actualizar se ejecuta la funcion actualizarIncidencia que se encuentra mas abajo y se le pasa toda la informacion de la incidencia para actualizarla
        });
        contenedor.appendChild(card);
    });
    // ACTIVAR ICONOS LUCIDE
    lucide.createIcons();
}
//Funcion para cargar las incidencias al iniciar la pagina, hace una solicitud al servidor para obtener las incidencias y luego las envia a mapearse
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

//-------------------------SECCION DESTINADA A LA BUSQUEDA DE LAS INCIDENCIAS-----------------------------------------------------------------------------------
//Metodo para hacer la busqueda de las incidencias por id
async function buscarIncidencias() {
    const tipoFiltro =//De un seleccion obtiene la opcion 
        document.getElementById('tipo-filtro').value;
    const valor =
        document.getElementById('input-busqueda')
            .value
            .trim();//Obtiene el valor que se ingreso en el input

    if (valor === '') {//Cuando el input esta vacion se van a cargar todas las ventas que haya en la bd
        cargarIncidencias();
        return;
    }
    
    switch (tipoFiltro) {
        case 'id':
            const valorBusqueda = parseInt(valor);
            console.log(valorBusqueda)
           url = `http://localhost:5000/api/bitacora/incidencias/laboratorio/1/${valorBusqueda}`;
            //En este segun lo que el cliente ingreso en el input lo coloca para mandar llamar el edpoint
            break;

        case 'Profesor':
            url = `http://localhost:5000/api/bitacora/incidencias/laboratorio/1/maestro/${valor}`;
            break;

        case 'Alumno':
            url = `http://localhost:5000/api/bitacora/incidencias/laboratorio/1/alumno/${valor}`;
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
        console.log(incidencias);

        mapearIncidencias(incidencias)//Mandara llamar el metodo para que mapee la incidencia encontrada

    } catch (error) {
        console.error("Error en búsqueda:", error);
    }
}

const search = document.getElementById('btn-buscar-filtro');
search.addEventListener('click', () => {//Boton que al clickear ejecuta el evento para que se busque la venta
    buscarIncidencias();
});
//-------------------------SECCION DESTINADA A LA CREACION DE LAS INCIDENCIAS-----------------------------------------------------------------------------------
//Metodo para crear una nueva incidencia, al dar click en el boton de crear incidencia se muestra un formulario para ingresar los datos de la nueva incidencia y luego se envia al servidor para que se guarde en la base de datos
const btnCrear = document.getElementById('btnagregar');
function mapForm(tipo) {
    const contenedor = document.getElementById('Form-incidencias');

    //  Modificamos los botones para que usen onclick="cambiarCantidad(...)"
    const bloqueCantidad = `
        <div class="field">
            <label>Cantidad:</label>
            <div class="stepper-container">
                <button type="button" class="btn-step" onclick="cambiarCantidad('restar')" style="width: 30px; cursor: pointer;">-</button>
                <input type="number" id="display-cantidad" name="cantidad" value="1" min="1" readonly>
                <button type="button" class="btn-step" onclick="cambiarCantidad('sumar')" style="width: 30px; cursor: pointer;">+</button>
            </div>
        </div>
    `;

    if (tipo === 'agregar') {
        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
            <form id="form-agregar" class="forms">
                <button type="button" class="btn-cerrar-dinamico" id ="cerrar-form-agregar">
                    &times;
                </button>
                <h3>Registro de Incidencia</h3>
                
                <label>Selecciona el material:</label>
                <select name="Material" id="select-ids" class="select-int">
                    <option value="">Cargando...</option>
                </select>

                ${bloqueCantidad}

                <input type="text" name="descripcion" placeholder="Descripción" required autofocus style="font-size: 16px;">
                <input type="text" name="maestro" placeholder="Expediente del Maestro" required autofocus style="font-size: 16px;">
                <input type="text" name="alumno" placeholder="Expediente del Alumno" required autofocus style="font-size: 16px;">

                <select name="Tipo" id="select-tipo" class="select-int">
                    <option value="Salida">Salida</option>
                    <option value="Entrada">Entrada</option>
                </select>
                
                <button type="submit">Guardar Incidencia</button>
            </form>
        `;

        cargarIdCombo();
        const btnCerrarPost = document.getElementById('cerrar-form-agregar');
        btnCerrarPost.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });

    } else if (tipo === 'actualizar') {
        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
            <form id="form-actualizar" class="forms">
                <button type="button" class="btn-cerrar-dinamico" id ="cerrar-form-actualizar">
                    &times;
                </button>
                <h3>Actualizar Incidencia</h3>
                
                <label>Selecciona el material:</label>
                <select name="Material" id="select-ids" class="select-int">
                    <option value="">Cargando...</option>
                </select>

                ${bloqueCantidad}

                <input type="text" name="descripcion" placeholder="Descripción" required autofocus>
                <input type="text" name="maestro" placeholder="Expediente del Maestro" required autofocus>
                <input type="text" name="alumno" placeholder="Expediente del Alumno" required autofocus>
                
                <select name="Tipo" id="select-tipo" class="select-tipo">
                    <option value="Salida">Salida</option>
                    <option value="Entrada">Entrada</option>
                </select>
                
                <button type="submit">Guardar Cambios</button>
            </form>
        `;

        cargarIdCombo();
        const btnCerrarUpdate = document.getElementById('cerrar-form-actualizar');
        btnCerrarUpdate.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });
    }
    
    // ¡Nota que toda la lógica de "btnPlus.addEventListener..." que estaba aquí fue eliminada!
}

function cambiarCantidad(operacion) {
    const inputCantidad = document.getElementById('display-cantidad');
    if (!inputCantidad) return; // Si el input no existe, no hace nada

    let valorActual = parseInt(inputCantidad.value);
    
    if (operacion === 'sumar') {
        inputCantidad.value = valorActual + 1;
    } else if (operacion === 'restar' && valorActual > 1) {
        inputCantidad.value = valorActual - 1;
    }
}






//-------------------------SECCION DESTINADA A LA ELIMINACION DE LAS INCIDENCIAS-----------------------------------------------------------------------------------
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
                `http://127.0.0.1:5000/api/bitacora/incidencias/${id}`,//Hace la solicitus por medio del edpoint de eliminar incidencia
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
//-------------------------SECCION DESTINADA A LA ACTUALIZACION DE LAS INCIDENCIAS-----------------------------------------------------------------------------------
