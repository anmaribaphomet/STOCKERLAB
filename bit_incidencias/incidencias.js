//-----------------------------------------SECCION DE NAV BAR E ICONOS
// Inicializar la carga de las incidencias al cargar la pagina y activar los iconos de lucide
document.addEventListener('DOMContentLoaded', () => {
    const nombreUsuario = obtenerNombreUsuario(); // Obtiene el nombre o redirige
    const elementoHeader = document.getElementById('txt-usuario-header');
    // --- LOGICA DEL SEMÁFORO DEL SERVIDOR ---
    verificarServidor(); // Primera revisión al cargar
    setInterval(verificarServidor, 30000); // Revisa el estado automáticamente cada 30 segundos
    if (elementoHeader) {
        elementoHeader.textContent = nombreUsuario;
    }
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


async function verificarServidor() {
    const contenedor = document.getElementById('status-server');
    const texto = document.getElementById('status-text');
    const dot = document.querySelector('.status-dot');

    if (!contenedor || !texto) return;

    try {
        // Hacemos la petición a tu endpoint de Flask
        const response = await fetch('http://127.0.0.1:5000/api/ping');
        const data = await response.json();

        if (response.ok && data.status === 'online') {
            // Cambiamos clases a ONLINE
            contenedor.classList.remove('offline');
            contenedor.classList.add('online');
            texto.textContent = 'Servidor Activo';
        } else {
            throw new Error('Status offline devuelto por la API');
        }
    } catch (error) {
        // Cambiamos clases a OFFLINE en caso de error o caída de red
        contenedor.classList.remove('online');
        contenedor.classList.add('offline');
        texto.textContent = 'Sin Conexión';
        console.error("Error de verificación del servidor:", error);
    }
}
//---------------------------OBTRENER EL ID DEL LABORATORIO DESDE EL LOCAL STORAGE PARA USARLO EN LAS SOLICITUDES AL SERVIDOR-------------------------------
const ID_LAB_ACTUAL = 1;

async function cargarNombreLaboratorio() {
    try {
        // Hacemos una petición a tu API de Flask para traer los datos del lab actual
        const respuesta = await fetch(`http://localhost:5000/api/laboratorios/${obtenerIdLab()}`);
        const datosLab = await respuesta.json();

        console.log("Datos del laboratorio obtenido:", datosLab.categoria); // Verifica que estás recibiendo el nombre correctamente
        if (respuesta.ok) {
            // Asumiendo que Flask devuelve algo como { "nombre": "Química" }
            document.getElementById('nombre-lab-dinamico').textContent = datosLab.categoria;
        }
    } catch (error) {
        console.error("Error al obtener el nombre del laboratorio:", error);
    }
}

// Ejecutamos la función apenas cargue la pantalla
cargarNombreLaboratorio();

//-------------------------SECCION DESTINADA A OBTENER LAS INCIDENCIAS-----------------------------------------------------------------------------------
function obtenerIdLab() {
    // IMPORTANTE: Asegúrate de usar el mismo nombre de llave en todo tu proyecto ("idLaboratorio")
    const idLab = sessionStorage.getItem("idLaboratorio");

    if (!idLab) {
        console.error("No se encontró una sesión activa de laboratorio.");
        window.location.href = "../login.html";
        throw new Error("Sesión inválida: Redirigiendo al login.");
    }
    return idLab;
}


function obtenerNombreUsuario() {
    const nombreUser = sessionStorage.getItem("nombreUsuario");

    if (!nombreUser) {
        console.error("No se encontró el nombre de usuario en la sesión activa.");
        window.location.href = "../login.html";
        throw new Error("Sesión inválida: Redirigiendo al login.");
    }
    return nombreUser;
}
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

        const fechaLimpia = incidencia.fecha.split('T')[0];
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
                    <p>${fechaLimpia}</p>
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
            eliminarIncidencia(incidencia.id_bitacora); // 👈 ¡Todo en minúsculas!
        });

        // BOTÓN ACTUALIZAR
        const btnActualizar = card.querySelector('.btn-actualizar');
        btnActualizar.addEventListener('click', () => {
            mapForm('actualizar', incidencia);
        });
        contenedor.appendChild(card);
    });
    // ACTIVAR ICONOS LUCIDE
    lucide.createIcons();
}
//Funcion para cargar las incidencias al iniciar la pagina, hace una solicitud al servidor para obtener las incidencias y luego las envia a mapearse
async function cargarIncidencias() {
    try {
        const respuesta = await fetch(`http://localhost:5000/api/bitacora/incidencias/laboratorio/${obtenerIdLab()}`);
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
            url = `http://localhost:5000/api/bitacora/incidencias/laboratorio/${obtenerIdLab()}/${valorBusqueda}`;
            //En este segun lo que el cliente ingreso en el input lo coloca para mandar llamar el edpoint
            break;

        case 'Profesor':
            url = `http://localhost:5000/api/bitacora/incidencias/laboratorio/${obtenerIdLab()}/maestro/${valor}`;
            break;

        case 'Alumno':
            url = `http://localhost:5000/api/bitacora/incidencias/laboratorio/${obtenerIdLab()}/alumno/${valor}`;
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
//METODO PARA MAPEAR LOS FORMULARIOS DE ACTUALIZAR Y CREAR
function mapForm(tipo, datos = null) {
    const contenedor = document.getElementById('Form-incidencias');

    // Bloque HTML para el paso de cantidades, reutilizado tanto en "Agregar" como en "Actualizar" 
    const bloqueCantidad = `
        <div class="field">
            <label>Cantidad:</label>
            <div class="stepper-container">
                <button type="button" class="btn-step" onclick="cambiarCantidad('restar')" style="width: 30px; cursor: pointer;">-</button>
                <input type="number" id="display-cantidad" name="cantidad" value="${datos ? datos.cantidad : 1}" min="1" readonly>
                <button type="button" class="btn-step" onclick="cambiarCantidad('sumar')" style="width: 30px; cursor: pointer;">+</button>
            </div>
        </div>
    `;
    // Dependiendo del tipo de formulario que se quiera mostrar, se renderiza el HTML correspondiente
    if (tipo === 'agregar') {
        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
            <form id="form-agregar" class="forms" onsubmit="event.preventDefault(); guardarIncidencia();">
                <button type="button" class="btn-cerrar-dinamico" onclick="cerrarFormulario()">
                    &times;
                </button>
                <h3>Registro de Incidencia</h3>
                
                <label>Selecciona el material:</label>
                <select name="Material" id="select-ids" class="select-int" required onchange="console.log('Valor seleccionado:', this.value)">
                    <option value="">Cargando...</option>
                </select>

                ${bloqueCantidad}

                <input type="text" id="ins-descripcion" name="descripcion" placeholder="Descripción" required autofocus style="font-size: 16px;">
                <input type="text" id="ins-maestro" name="maestro" placeholder="Expediente del Maestro" required autofocus style="font-size: 16px;">
                <input type="text" id="ins-alumno" name="alumno" placeholder="Expediente del Alumno" required autofocus style="font-size: 16px;">

                <select name="Tipo" id="select-tipo" class="select-int">
                    <option value="0">Salida</option>
                    <option value="1">Entrada</option>
                </select>
                
                <button type="submit">Guardar Incidencia</button>
            </form>
        `;

        cargarCombo();// Carga el combo de materiales para el formulario de agregar

        //Mapeo para el form de actualizar, se le pasan los datos de la incidencia seleccionada para que se muestren en el formulario y se puedan modificar
    } else if (tipo === 'actualizar') {
        const fechaLimpia = datos.fecha.split('T')[0];
        // Escudo protector: Si 'datos' viene vacío, cancelamos antes de que explote
        if (!datos) {
            console.error("Error: No se enviaron los datos al formulario de actualización");
            alert("No se pudo cargar la información de esta incidencia.");
            return;
        }

        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
            <form id="form-actualizar" class="forms" onsubmit="event.preventDefault(); modificarIncidencia(${datos.id_bitacora});">
                <button type="button" class="btn-cerrar-dinamico" onclick="cerrarFormulario()">
                    &times;
                </button>
                <p style="margin-top: 0px;">${fechaLimpia}</p>
                <h3>Actualizar Incidencia (${datos.id_bitacora})</h3>
                

                <label>Selecciona el material:</label>
                <select name="Material" id="select-ids" class="select-int" required onchange="console.log('Valor seleccionado:', this.value)">
                    <option value="">Cargando...</option>
                </select>

                ${bloqueCantidad}

                <input type="text" id="ins-descripcion" value="${datos.descripcion}" placeholder="Descripción" required>
                <input type="text" id="ins-maestro" value="${datos.exp_maestro}" placeholder="Expediente del Maestro" required>
                <input type="text" id="ins-alumno" value="${datos.exp_alumno}" placeholder="Expediente del Alumno" required>
                
                <select name="Tipo" id="select-tipo" class="select-int">
                    <option value="0" ${datos.tipo === 'Salida' ? 'selected' : ''}>Salida</option>
                    <option value="1" ${datos.tipo === 'Entrada' ? 'selected' : ''}>Entrada</option>
                </select>
                
                <button type="submit">Guardar Cambios</button>
            </form>
        `;
        cargarCombo(datos.id_material);

    }

}
//FUNCION PARA GUARDAR EL FORMULARIO DE AGREGAR(POST)
async function guardarIncidencia() {
    const payload = recolectarDatosFormulario();
    console.log("Payload a enviar:", payload);
    if (!payload) return; // Si no pasa las validaciones de JS, detiene la ejecución

    try {
        const respuesta = await fetch(`http://localhost:5000/api/bitacora/incidencias/laboratorio/${obtenerIdLab()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await respuesta.json();
        if (respuesta.ok) {
            // Alerta de éxito con estilo oscuro y botón índigo
            Swal.fire({
                title: '¡Guardado!',
                text: resultado.mensaje,
                icon: 'success',
                background: '#1c2242',       // Tu color --bg-muted2
                color: '#f8fafc',            // Tu color --text-main
                confirmButtonColor: '#4a28ff', // Tu color --accent-main
                iconColor: '#00e6a8',        // Tu color --success
                width: '320px'
            }).then(() => {
                // Poner esto dentro del .then() hace que el formulario se cierre 
                // y la tabla se recargue JUSTO DESPUÉS de que el usuario le da "OK" a la alerta
                document.getElementById('Form-incidencias').style.display = 'none';
                cargarIncidencias();
            });
        } else {
            // Alerta de error (rechazo del servidor) con botón magenta
            Swal.fire({
                title: 'Error',
                text: resultado.error,
                icon: 'error',
                background: '#1c2242',
                color: '#f8fafc',
                confirmButtonColor: '#ff2a5f', // Tu color --danger
                width: '320px'
            });
        }
    } catch (error) {
        console.error("Error al guardar:", error);
        // Alerta de error crítico (no hay conexión)
        Swal.fire({
            title: 'Sin conexión',
            text: 'No se pudo conectar con el servidor.',
            icon: 'error',
            background: '#1c2242',
            color: '#f8fafc',
            confirmButtonColor: '#ff2a5f',
            width: '320px'
        });
    }
}
//FUNCION PARA GUARDAR EL FORMULARIO DE ACTUALIZAR (PUT)
async function modificarIncidencia(id_inc) {
    const payload = recolectarDatosFormulario();
    if (!payload) return;

    try {
        const respuesta = await fetch(`http://localhost:5000/api/bitacora/incidencias/laboratorio/${obtenerIdLab()}/${id_inc}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            // Alerta de éxito con estilo oscuro y botón índigo
            Swal.fire({
                title: '¡Actualizado!',
                text: resultado.mensaje,
                icon: 'success',
                background: '#1c2242',
                color: '#f8fafc',
                confirmButtonColor: '#4a28ff',
                iconColor: '#00e6a8',
                width: '320px'
            }).then(() => {
                document.getElementById('Form-incidencias').style.display = 'none';
                cargarIncidencias();
            });
        } else {
            // Alerta de error (rechazo del servidor) con botón magenta
            Swal.fire({
                title: 'Error',
                text: resultado.error,
                icon: 'error',
                background: '#1c2242',
                color: '#f8fafc',
                confirmButtonColor: '#ff2a5f',
                width: '320px'
            });
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        // Alerta de error crítico (no hay conexión)
        Swal.fire({
            title: 'Sin conexión',
            text: 'No se pudo conectar con el servidor.',
            icon: 'error',
            background: '#1c2242',
            color: '#f8fafc',
            confirmButtonColor: '#ff2a5f',
            width: '320px'
        });
    }
}
//FUNCION DE CERRAR LOS FORMULARIOS
function cerrarFormulario() {
    const contenedor = document.getElementById('Form-incidencias');
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}
//FUNCION PARA EL PASO DE CANTIDADES (MANTENIDA GLOBAL PARA SER USADA EN AMBOS FORMULARIOS)
function cambiarCantidad(operacion) {
    const inputCantidad = document.getElementById('display-cantidad');
    if (!inputCantidad) return; // Si el input no existe, no hace nada

    let valorActual = parseInt(inputCantidad.value);

    if (operacion === 'sumar') { // Si la operación es sumar, incrementa el valor actual en 1
        inputCantidad.value = valorActual + 1;
    } else if (operacion === 'restar' && valorActual > 1) { // Si la operación es restar y el valor actual es mayor a 1, decrementa el valor actual en 1
        inputCantidad.value = valorActual - 1;
    }
}

//--------------------LLENAR COMBOBOX DE LOS MATERIALES--------------------------------------------------------------------------------------
async function cargarCombo(id_material_seleccionado = null) {
    const selectMaterial = document.getElementById('select-ids');
    if (!selectMaterial) return;

    try {
        // Hacemos la petición a la API para obtener los materiales del laboratorio actual
        const respuesta = await fetch(`http://localhost:5000/api/materiales/laboratorio/${obtenerIdLab()}`);

        if (!respuesta.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        const materiales = await respuesta.json();// Obtenemos el array de materiales desde la respuesta JSON

        // Limpiamos el combo y colocamos la opción por defecto inicial
        selectMaterial.innerHTML = '<option value="">-- Seleccione un Material --</option>';

        // Recorremos la lista de materiales que nos devolvió Flask
        materiales.forEach(material => {
            const opcion = document.createElement('option');


            opcion.value = material.IdMaterial;// El valor de la opción es el ID del material          
            opcion.textContent = material.Nombre_Material; // El texto que se muestra en el combo es el nombre del material

            // Si se pasó un ID de material seleccionado (en el caso de actualizar) y coincide con el material actual del loop, marcamos esa opción como seleccionada
            if (id_material_seleccionado && material.IdMaterial === parseInt(id_material_seleccionado)) {
                opcion.selected = true;
            }
            // Agregamos la opción al elemento select
            selectMaterial.appendChild(opcion);
        });

    } catch (error) {
        console.error("Error al poblar el combo de materiales:", error);
        selectMaterial.innerHTML = '<option value="">Error al cargar materiales</option>';
    }
}

//  RECOLECTAR Y VALIDAR DATO DE LOS VALORES INGRESADOS EN LOS FORMULARIOS DE AGREGAR Y ACTUALIZAR, PARA LUEGO ENVIARLOS EN EL BODY DE LAS SOLICITUDES POST Y PUT
function recolectarDatosFormulario() {
    const id_material = document.getElementById('select-ids').value;
    const cantidad = parseInt(document.getElementById('display-cantidad').value);
    const descripcion = document.getElementById('ins-descripcion').value.trim();
    const exp_maestro = document.getElementById('ins-maestro').value.trim();
    const exp_alumno = document.getElementById('ins-alumno').value.trim();
    const tipoVal = document.getElementById('select-tipo').value;

    const tipo = tipoVal === "1" ? "Entrada" : "Salida";

    // 1. Creamos una configuración base para las alertas de error
    const alertaError = {
        icon: 'error',
        width: '280px',
        confirmButtonColor: '#855597', // Tu color morado
        confirmButtonText: 'Entendido'
    };

    // 2. Reemplazamos los alert() usando Swal.fire y el operador spread (...) 
    // para combinar la configuración base con el título y texto específico.
    if (!id_material) {
        Swal.fire({ ...alertaError, title: 'Falta Material', text: 'Por favor, selecciona un material válido.' });
        return null;
    }
    if (cantidad <= 0) {
        Swal.fire({ ...alertaError, title: 'Cantidad Inválida', text: 'La cantidad debe ser un número positivo mayor a cero.' });
        return null;
    }
    if (exp_maestro.length !== 9 || isNaN(exp_maestro)) {
        Swal.fire({ ...alertaError, title: 'Expediente Inválido', text: 'El expediente del maestro debe contener exactamente 9 dígitos numéricos.' });
        return null;
    }
    if (exp_alumno.length !== 9 || isNaN(exp_alumno)) {
        Swal.fire({ ...alertaError, title: 'Expediente Inválido', text: 'El expediente del alumno debe contener exactamente 9 dígitos numéricos.' });
        return null;
    }

    return {
        id_material: parseInt(id_material),
        tipo: tipo,
        cantidad: cantidad,
        descripcion: descripcion,
        exp_maestro: exp_maestro,
        exp_alumno: exp_alumno
    };
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
//CERRAR SESION
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: 'Tendrás que ingresar tus credenciales nuevamente para acceder.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#8b5a96',
        cancelButtonColor: '#bfaec6',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        zIndex: 999999
    }).then((result) => {
        if (result.isConfirmed) {

            sessionStorage.removeItem("idLaboratorio");
            sessionStorage.removeItem("nombreUsuario");

            window.location.href = "../login.html";
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    obtenerIdLab();
    const nombreUsuario = obtenerNombreUsuario();

    const elementoHeader = document.getElementById('txt-usuario-header');
    if (elementoHeader) {
        elementoHeader.textContent = nombreUsuario;
    }


    const btnSalir = document.getElementById('btn-cerrar-sesion');
    if (btnSalir) {
        btnSalir.addEventListener('click', cerrarSesion);
    }


    configurarBotonAdd();
    lucide.createIcons();
    cargarMaterial();
});



