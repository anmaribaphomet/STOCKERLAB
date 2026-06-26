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
    lucide.createIcons();
    console.log(obtenerIdLab());
    cargarBitacoras();
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

const btnIncidencias = document.getElementById('btn-nav-incidencias');
btnIncidencias.addEventListener('click', () => {
    window.location.href = '../bit_incidencias/incidencias.html';
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


//-------------------------SECCION DESTINADA A LAS BITACORAS-----------------------------------------------------------------------------------

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

//-------------------------SECCION DESTINADA A OBTENER LAS INCIDENCIAS-----------------------------------------------------------------------------------

//Funcion para mapear las incidencias obtenidas de la base de datos y mostrarlas en la pantalla en tarjetas dinamicas
function mapearBitacoras(bitacoras) {

    const contenedor = document.getElementById('contenedor-bitacoras');
    contenedor.innerHTML = '';
    if (!bitacoras) return;
    // SI ES UNA SOLA INCIDENCIA LA CONVIERTE EN UN
    // ARRAY PARA QUE EL MAPEO FUNCIONE CORRECTAMENTE, SI YA ES UN ARRAY SIMPLEMENTE LO USA COMO ESTA
    //Valida que sea una array lo que le esta pasando
    const listaBitacoras = Array.isArray(bitacoras)
        ? bitacoras
        : [bitacoras];//Si no es un array lo convierte en un array con un solo elemento que es la incidencia obtenida

    listaBitacoras.forEach(bitacoras => {//Por cada incidencia obtenida de la base de datos se crea una card dinamica con la informacion de la incidencia
        let tipoCard = bitacoras.tipo;

        if (tipoCard == true) {
            tipoCard = "Entrada";
        } else {
            tipoCard = "Salida";
        }
        const card = document.createElement('div');
        card.className = 'bitacoras-card';


        //Card
        card.innerHTML = `
            <!-- BOTÓN ACTUALIZAR -->
            <button 
                class="btn-actualizar"
                title="Actualizar Bitacora">
                <i data-lucide="pencil"></i>
            </button>
             <!-- BOTÓN ELIMINAR -->
            <button 
                class="btn-eliminar"
                title="Eliminar Bitacoras">
                <i data-lucide="trash-2"></i>
            </button>
            <div class="bitacora-header">
                <div>
                    <h3>Registro #${bitacoras.id_bitacora}</h3>
                    <p>${bitacoras.fecha}</p>
                </div>
                
                <div class="bitacora-descripcion">
                   ${tipoCard}
                </div>
            </div>
            <div class="bitacora-body">
               
            </div>
            <button class="btn-leer-mas">
                Ver detalles
            </button>
            <div class="detalles">
                <ul>
                   <li class="bitacora-item">
                <div>
                    <strong>#${bitacoras.id_material + ' - ' + bitacoras.nombre_material}</strong>
                </div>
                <div class="bitacora-info">
                     <span>Descripción: ${bitacoras.descripcion}</span>
                     <span>Cantidad: ${bitacoras.cantidad}</span>
                     <span>Exp. Maestro: ${bitacoras.exp_maestro}</span         
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
            eliminarBitacoraMaterial(bitacoras.id_bitacora);//Al dar click en el boton eliminar se ejecuta la funcion eliminarIncidencia que se encuentra mas abajo y se le pasa el id de la incidencia para eliminarla
        });

        // BOTÓN ACTUALIZAR
        const btnActualizar = card.querySelector('.btn-actualizar');
        btnActualizar.addEventListener('click', () => {
            actualizarBitacora(bitacoras);
        });
        contenedor.appendChild(card);
    });
    // ACTIVAR ICONOS LUCIDE
    lucide.createIcons();
}
//Funcion para cargar las incidencias al iniciar la pagina, hace una solicitud al servidor para obtener las incidencias y luego las envia a mapearse
async function cargarBitacoras() {
    try {
        const idPagina = obtenerIdLab();
        const respuesta = await fetch(`http://localhost:5000/api/bitacora/laboratorio/${idPagina}`);
        const bitacoras = await respuesta.json();
        mapearBitacoras(bitacoras);
        console.log(bitacoras);
    } catch (error) {
        console.error("Error al obtener las bitacoras:", error);
    }
}




//-------------------------SECCION DESTINADA A LA BUSQUEDA DE LAS INCIDENCIAS-----------------------------------------------------------------------------------
//Metodo para hacer la busqueda de las bitacoras materiales por id
async function buscarBitacoras() {
    const IdEnUso = obtenerIdLab();
    const tipoFiltro =//De un seleccion obtiene la opcion 
        document.getElementById('tipo-filtro').value;
    const valor =
        document.getElementById('input-busqueda')
            .value
            .trim();//Obtiene el valor que se ingreso en el input

    if (valor === '') {//Cuando el input esta vacion se van a cargar todas las ventas que haya en la bd
        cargarBitacoras();
        return;
    }

    switch (tipoFiltro) {
        case 'id':
            const valorBusqueda = parseInt(valor);
            console.log(valorBusqueda)
            url = `http://localhost:5000/api/bitacora/laboratorio/${IdEnUso}/${valorBusqueda}`;
            //En este segun lo que el cliente ingreso en el input lo coloca para mandar llamar el edpoint
            break;

        case 'Profesor':
            url = `http://localhost:5000/api/bitacora/laboratorio/${IdEnUso}/maestro/${valor}`;
            break;

    }
    try {
        const respuesta = await fetch(url);//pide la informacion al servidor
        if (!respuesta.ok) {//si el servidor no obtiene nada va colocar un mensaje en la pantalla de que el id no fue encontrado

            const contenedor = document.getElementById('contenedor-bitacoras');

            contenedor.innerHTML = `
                <p class="mensaje-error">
                    No se encontró ninguna bitacora con ese ID , ${valor}
                </p>
            `;

            return;
        }
        const bitacoras = await respuesta.json();//Si obtiene la informacion correctamente
        console.log(bitacoras);

        mapearBitacoras(bitacoras)//Mandara llamar el metodo para que mapee la bitacora encontrada

    } catch (error) {
        console.error("Error en búsqueda:", error);
    }
}

const search = document.getElementById('btn-buscar-filtro');
search.addEventListener('click', () => {//Boton que al clickear ejecuta el evento para que se busque la venta
    buscarBitacoras();
});


//-------------------------SECCION DESTINADA A LA CREACION DE BITACORAS-----------------------------------------------------------------------------------
function actualizarBitacora(bitacora) {
    mapForm('editar', bitacora);
}
const btnCrear = document.getElementById('btnagregar');
//OBJETO QUE ALMACENARA LOS DATOS QUE CONSTITUYEN LA BITACORA MAT
let datosBitacoraMateriales = {
    idMaterial: '',
    nombreMaterial: '',
    cantidad: 1,
    descripcion: '',
    maestro: '',
    tipoBitacora: 'Salida'
};

/**NOTA : CON EL FIN DE REUTILIZAR EL FORM Y LA MAYORIA DE LOS METODOS QUE HACEN QUE FUNCIONE , EL AGREGAR MATERIAL SE INCORPORARA */
function mapForm(tipo, bitacora = null) {//El form debe aceptar datos opciones 
    const contenedor = document.getElementById('Form-bitacoras');
    // SI ES EDICIÓN
    if (tipo === 'editar' && bitacora) {

        datosBitacoraMateriales = {
            idBitacora: bitacora.id_bitacora,
            idMaterial: bitacora.id_material,
            nombreMaterial: bitacora.nombre_material,
            cantidad: bitacora.cantidad,
            descripcion: bitacora.descripcion,
            maestro: bitacora.exp_maestro,
            tipoBitacora: bitacora.tipo ? 'Entrada' : 'Salida'
        };

        console.log(datosBitacoraMateriales);

    } else {

        // SI ES CREAR
        datosBitacoraMateriales = {
            idMaterial: '',
            nombreMaterial: '',
            cantidad: 1,
            descripcion: '',
            maestro: '',
            tipoBitacora: 'Salida'
        };
    }

    if (tipo === 'agregar' || tipo === 'editar') {//que acceda a este componente ya sea para agregar o editar
        if (tipo === 'agregar') {
            datosBitacoraMateriales = {
                idMaterial: '',
                nombreMaterial: '',
                cantidad: 1,
                descripcion: '',
                maestro: '',
                tipoBitacora: 'Salida'
            };
        }
        contenedor.style.display = 'flex';

        /**NOTA : Los componentes del tipo input y demas al tratarse inicialmente de un form de agregar, deben ser modificados
         * para carguen datos que ya existen o reciban datos , dependiento el uso que se le de al componente
         */
        contenedor.innerHTML = `
            <form id="form-actualizar" class="forms animate-pop">
                <button type="button" class="btn-cerrar-dinamico" id="cerrar-form-agregar">
                    &times;
                </button>

                <div class="contador">
                    <div id="ventana1" class="cuadros">
                        <div class="circulos" id="c-ventana1">
                            <i data-lucide="check" id="icono-v1" class="icono-check-animado" style="width: 16px; height: 16px; color: white;"></i>
                        </div>
                        <p class="texto">
                            Materiales
                        </p>
                    </div>


                    <div class="linea"></div>
                    <div id="ventana2" class="cuadros">
                        <div class="circulos" id="c-ventana2">
                            <i data-lucide="check" id="icono-v2" class="icono-check-animado" style="width: 16px; height: 16px; color: white;"></i>
                        </div>
                        <p class="texto">Info</p>
                    </div>
                    <div class="linea"></div>
                    <div id="ventana3" class="cuadros">
                        <div class="circulos" id="c-ventana3">
                            <i data-lucide="check" id="icono-v3" class="icono-check-animado"style="width: 70%;"></i>
                        </div>
                        <p class="texto">
                            Preview
                        </p>
                    </div>

                </div>
                <div id="contenedor-Etapas-Forms">
                    <div id="primeraParte">
                        <h2>${tipo === 'editar' ? 'Editar Bitácora' : 'Crear Bitácora'}</h2>
                        <label>Selecciona el material:</label>
                        <select name="Material" id="select-ids" class="select-tipo">
                            <option value="">Cargando...</option>
                        </select>
                        <div id="cargar-Material">
                            <!--Js insertara una card con el material-->
                        </div>
                        <button  type="button" id="nav-2">
                            <i data-lucide="arrow-right" id="c-ventana3" style="width: 70%;"></i>
                        </button>
                    </div>

                    <div id="segundaParte" style="display: none;">
                        <h3>Info Bitacora</h3>
                        <Label>${tipo === 'editar' ? 'Actualiza la descripcion' : 'Agrega una descripcion*'}</Label>
                        <input 
                            type="text"
                            id="input-descripcion"
                            placeholder="${tipo != 'editar' ? 'Descripcion' : ''}"
                            value="${datosBitacoraMateriales.descripcion || ''}"
                        >
                        <Label>${tipo === 'editar' ? 'Actualiza el expediente del maestro' : 'Ingresa el expediente del profesor*'}</Label>
                        <input 
                            type="text"
                            id="input-maestro"
                            placeholder="${tipo != 'editar' ? 'Expediente Maestro' : ''}"
                            value="${datosBitacoraMateriales.maestro || ''}"
                        >

                        <Label>${tipo === 'editar' ? 'Actualiza el tipo de bitacora' : 'Elije el tipo de bitacora*'}</Label>
                        <select name="Tipo" id="select-tipo" class="select-tipo">
                            <option value="Salida"
                                ${datosBitacoraMateriales.tipoBitacora === 'Salida' ? 'selected' : ''}>
                                Salida
                            </option>
                              <option value="Entrada"
                                ${datosBitacoraMateriales.tipoBitacora === 'Entrada' ? 'selected' : ''}>
                                Entrada
                            </option>
                        </select>

                        <button type="button" id="nav-3">
                            <i data-lucide="arrow-right" id="c-ventana3" style="width: 70%;"></i>
                        </button>
                        <button type="button" id="nav-4">
                            <i data-lucide="arrow-left" id="c-ventana3" style="width: 70%;"></i>
                        </button>
                    </div>

                    <div id="TerceraParte" style="display: none;">
                        <h3>Resumen de Bitácora</h3>
                        <div id="materiales-info">
                            <!--js insertara la informacion del material-->
                        </div>

                        <div id="bitacora-info">
                            <!--Js insertara la informacion de la bitacora-->
                        </div>


                        <button type="submit"
                            id="${tipo === 'editar' ? 'botonC-editar' : 'botonC-agregar'}"
                        >
                            ${tipo === 'editar' ? 'Actualizar Bitácora' : 'Guardar Cambios'}
                        </button>
                        <button type="button"  id="nav-5">
                            <i data-lucide="arrow-left" id="c-ventana3" style="width: 70%;"></i>
                        </button>
                    </div>
                </div>
            </form>
        `;

        cargarComboMateriales(tipo);
        lucide.createIcons();

        // Inicializar el menú superior en el paso 1 (sin palomitas)
        cambioColorMenuSuperior('primeraParte');
        const btnCerrarPost = document.getElementById('cerrar-form-agregar');
        btnCerrarPost.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });


        //CONTROL DE NAVEGACIONES
        const etapa1 = document.getElementById('primeraParte');
        const etapa2 = document.getElementById('segundaParte');
        const etapa3 = document.getElementById('TerceraParte');

        const boton2 = document.getElementById('nav-2');

        // AVANZAR A ETAPA 2
        boton2.addEventListener('click', () => {
            const selectMaterial = document.getElementById('select-ids');

            // VALIDACIÓN: ¿Seleccionó un material válido?
            if (!selectMaterial.value) {
                Swal.fire({
                    title: 'Atención',
                    text: 'Por favor, selecciona un material antes de continuar.',
                    icon: 'warning', // Usamos 'warning' (advertencia) ya que es un aviso preventivo
                    confirmButtonColor: '#8b5a96', // Tu color morado característico
                    confirmButtonText: 'Entendido',
                    zIndex: 99999
                });
                return;
            }

            // Almacenar datos recolectados en la etapa 1
            datosBitacoraMateriales.idMaterial = selectMaterial.value;
            const inputCantidad = document.getElementById('display-cantidad');
            datosBitacoraMateriales.cantidad = inputCantidad ? parseInt(inputCantidad.value) : 1;
            // Transición
            etapa1.style.display = 'none';
            etapa2.style.display = 'block';
            cambioColorMenuSuperior('segundaParte');
        });


        const boton3 = document.getElementById('nav-3');
        // AVANZAR A ETAPA 3 
        boton3.addEventListener('click', () => {
            const desc = document.getElementById('input-descripcion').value.trim();
            const maestro = document.getElementById('input-maestro').value.trim();
            const tipo = document.getElementById('select-tipo').value;

            // VALIDACIÓN: Campos vacíos
            if (!desc || !maestro) {
                Swal.fire({
                    title: 'Atención',
                    text: 'Por favor, rellena todos los campos obligatorios (*).',
                    icon: 'warning',
                    confirmButtonColor: '#8b5a96',
                    confirmButtonText: 'Entendido',
                    zIndex: 99999
                });
                return;
            }

            // Almacenar datos recolectados en la etapa 2
            datosBitacoraMateriales.descripcion = desc;
            datosBitacoraMateriales.maestro = maestro;
            datosBitacoraMateriales.tipoBitacora = tipo;

            // Generar dinámicamente el Resumen en la Etapa 3
            generarResumen();

            // Transición
            etapa2.style.display = 'none';
            etapa3.style.display = 'block';
            cambioColorMenuSuperior('TerceraParte');

            console.log(datosBitacoraMateriales);
        });

        // RETROCEDER A ETAPA 1 
        const boton4 = document.getElementById('nav-4');
        boton4.addEventListener('click', () => {
            etapa2.style.display = 'none';
            etapa1.style.display = 'block';
            cambioColorMenuSuperior('primeraParte');
        });

        // RETROCEDER A ETAPA 2 
        const boton5 = document.getElementById('nav-5');
        boton5.addEventListener('click', () => {
            etapa3.style.display = 'none';
            etapa2.style.display = 'block';
            cambioColorMenuSuperior('segundaParte');
        });
    }
    // ¡Nota que toda la lógica de "btnPlus.addEventListener..." que estaba aquí fue eliminada!
}


//FUNCION PARA MAPEAR EL RESUMEN

function generarResumen() {
    const contenedorMaterial = document.getElementById('materiales-info');
    const contenedorBitacora = document.getElementById('bitacora-info');

    contenedorMaterial.innerHTML = `
        <h4>Material Seleccionado</h4>
        <p><strong>Nombre:</strong> ${datosBitacoraMateriales.nombreMaterial}</p>
        <p><strong>ID:</strong> ${datosBitacoraMateriales.idMaterial}</p>
        <p><strong>Cantidad Solicitada:</strong> ${datosBitacoraMateriales.cantidad}</p>
    `;

    contenedorBitacora.innerHTML = `
        <h4>Detalles de la Bitácora</h4>
        <p><strong>Profesor:</strong> ${datosBitacoraMateriales.maestro}</p>
        <p><strong>Tipo:</strong> ${datosBitacoraMateriales.tipoBitacora}</p>
        <p><strong>Descripción:</strong> ${datosBitacoraMateriales.descripcion}</p>
    `;
}


async function cargarMat() {
    const IdEnUso = obtenerIdLab();

    try {
        const respuesta = await fetch(`http://localhost:5000/api/materiales/laboratorio/${IdEnUso}`); // Ruta que trae todas
        const materiales = await respuesta.json();

        if (respuesta.ok) {//si el servidor no obtiene nada va colocar un mensaje en la pantalla de que el id no fue encontrado
            return materiales;
        }


    } catch (error) {
        console.error("Error al cargar IDs:", error);
    }
}

async function cargarComboMateriales(tipo) {
    const IdEnUso = obtenerIdLab();
    const select = document.getElementById('select-ids');
    const materiales = await cargarMat();
    select.innerHTML = '<option value="">Seleccione un Material</option>';

    // Creamos una opción por cada editorial
    materiales.forEach(ed => {
        const opcion = document.createElement('option');
        opcion.value = ed.IdMaterial; // El valor que se envía a Python
        opcion.textContent = `ID: ${ed.IdMaterial} - ${ed.Nombre_Material}`; // Lo que ve el usuario
        select.appendChild(opcion);
    });

    if (tipo === 'editar') {

        select.value = datosBitacoraMateriales.idMaterial;
        cargarInfoMateriales(datosBitacoraMateriales.idMaterial);
    }


    select.addEventListener('change', (e) => {
        const idSeleccionado = e.target.value;
        const materialEncontrado = materiales.find(ed => ed.IdMaterial == idSeleccionado);

        if (materialEncontrado) {
            datosBitacoraMateriales.nombreMaterial = materialEncontrado.Nombre_Material; // Guardamos el nombre comercial en memoria
            cargarInfoMateriales(materialEncontrado.IdMaterial);
        } else {
            document.getElementById('cargar-Material').innerHTML = '';
        }
    });

}

async function cargarInfoMateriales(idMaterial) {
    const idActual = obtenerIdLab();
    const contenedor = document.getElementById('cargar-Material');
    try {
        const respuesta = await fetch(`http://localhost:5000/api/materiales/laboratorio/${idActual}/${idMaterial}`); // Ruta que trae todas
        const materiales = await respuesta.json();

        if (respuesta.ok) {//si el servidor no obtiene nada va colocar un mensaje en la pantalla de que el id no fue encontrado
            const m = Array.isArray(materiales) ? materiales[0] : materiales;
            if (m) {
                contenedor.innerHTML = `
                    <div class="card-material">
                        <p><strong>ID:</strong> ${m.IdMaterial}</p>
                        <h2>${m.Nombre_Material}</h2>
                        <div class="field">
                            <label>Cantidad:</label>
                            <div class="stepper-container">
                                <button type="button" class="btn-step" onclick="cambiarCantidad('restar')" style="width: 30px; cursor: pointer;">-</button>
                                <input type="number" id="display-cantidad" name="cantidad" value="${datosBitacoraMateriales.cantidad || 1}" min="1" readonly>
                                <button type="button" class="btn-step" onclick="cambiarCantidad('sumar')" style="width: 30px; cursor: pointer;">+</button>
                            </div>
                        </div>

                    </div>
                `;
            } else {
                contenedor.innerHTML = '<p>No se encontró información de este material.</p>';
            }
        }

    } catch (error) {
        console.error("Error al cargar IDs:", error);
    }
}


function cambiarCantidad(operacion) {
    const inputCantidad = document.getElementById('display-cantidad');
    if (!inputCantidad) return;

    let valorActual = parseInt(inputCantidad.value);

    if (operacion === 'sumar') {
        valorActual += 1;
    } else if (operacion === 'restar' && valorActual > 1) {
        valorActual -= 1;
    }

    inputCantidad.value = valorActual;
    datosBitacoraMateriales.cantidad = valorActual;
}

function cambioColorMenuSuperior(id) {
    const circulo1 = document.getElementById('c-ventana1');
    const circulo2 = document.getElementById('c-ventana2');
    const circulo3 = document.getElementById('c-ventana3');

    const icono1 = document.getElementById('icono-v1');
    const icono2 = document.getElementById('icono-v2');
    const icono3 = document.getElementById('icono-v3');

    const colorActivo = '#6a1b9a';
    const colorApagado = '#ccc';

    if (id === 'primeraParte') {
        // Círculo 1 activo (crece), sin palomita
        circulo1.style.backgroundColor = colorActivo;
        circulo1.classList.add('activo');
        icono1.classList.remove('mostrar');

        // Círculo 2 apagado
        circulo2.style.backgroundColor = colorApagado;
        circulo2.classList.remove('activo');
        icono2.classList.remove('mostrar');

        // Círculo 3 apagado
        circulo3.style.backgroundColor = colorApagado;
        circulo3.classList.remove('activo');
        icono3.classList.remove('mostrar');
    }
    else if (id === 'segundaParte') {
        // Círculo 1 completado (mantiene color y activa palomita con fade-in)
        circulo1.style.backgroundColor = colorActivo;
        circulo1.classList.remove('activo');
        icono1.classList.add('mostrar');

        // Círculo 2 activo (crece), sin palomita aún
        circulo2.style.backgroundColor = colorActivo;
        circulo2.classList.add('activo');
        icono2.classList.remove('mostrar');

        // Círculo 3 apagado
        circulo3.style.backgroundColor = colorApagado;
        circulo3.classList.remove('activo');
        icono3.classList.remove('mostrar');
    }
    else if (id === 'TerceraParte') {
        // Círculos 1 y 2 completados con sus palomitas puestas
        circulo1.style.backgroundColor = colorActivo;
        circulo1.classList.remove('activo');
        icono1.classList.add('mostrar');

        circulo2.style.backgroundColor = colorActivo;
        circulo2.classList.remove('activo');
        icono2.classList.add('mostrar');

        // Círculo 3 activo (crece)
        circulo3.style.backgroundColor = colorActivo;
        circulo3.classList.add('activo');
        icono3.classList.remove('mostrar');
    }

    // Volvemos a inicializar los iconos por si Lucide necesita re-renderizar
    lucide.createIcons();
}

const contenedorForms = document.getElementById('Form-bitacoras');
contenedorForms.addEventListener('submit', async (e) => {//Se coloca un lsitener para detectar que formulario esta activo dentro del contenedor
    e.preventDefault(); // Detenemos la recarga de página
    const idLabActual = obtenerIdLab();

    const tipo = datosBitacoraMateriales.tipoBitacora;
    let almcTipo = 0;
    if (tipo == "Entrada") {
        almcTipo = 1;
    }

    const datosEnviar = {
        "Descripcion": datosBitacoraMateriales.descripcion,
        "Tipo": almcTipo,
        "Cantidad": datosBitacoraMateriales.cantidad,
        "Exp_Maestro": datosBitacoraMateriales.maestro,
        "IdLaboratorio": idLabActual,
        "IdMaterial": datosBitacoraMateriales.idMaterial
    };

    // Definimos la URL según el formulario
    let url = 'http://127.0.0.1:5000/bitacora/materiales';
    let metodo = 'POST'; // Por defecto para agregar

    const esEditar = document.getElementById('botonC-editar');

    if (esEditar) {

        metodo = 'PUT';

        url = `http://127.0.0.1:5000/bitacora/atualizar/materiales/${datosBitacoraMateriales.idBitacora}`;
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosEnviar)
        });

        const resultado = await respuesta.json();
        if (respuesta.ok) {
            const mensaje = resultado.mensaje || "Operación exitosa";

            // Usamos .then() para esperar a que el usuario cierre la alerta
            Swal.fire({
                title: '¡Éxito!',
                text: mensaje,
                icon: 'success',
                confirmButtonColor: '#8b5a96',
                zIndex: 99999
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload(); // Recarga solo tras confirmar
                }
            });

        } else {
            const mensajeAl = resultado.error || "Ocurrió un problema";

            Swal.fire({
                title: 'Error',
                text: `Detalle: ${mensajeAl}`,
                icon: 'error',
                confirmButtonColor: '#8b5a96',
                zIndex: 99999
            });
        }

    } catch (error) {
        console.error("Error en la petición:", error);
    }
});


//-------------------------SECCION DESTINADA A LA ELIMINACION DE LAS INCIDENCIAS-----------------------------------------------------------------------------------
async function eliminarBitacoraMaterial(id) {//Metodo para eliminar una incidencia desde un boton que se encuentra en las cards
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
                `http://127.0.0.1:5000/api/bitacoras/materiales/eliminar/${id}`,//Hace la solicitus por medio del edpoint de eliminar incidencia
                {
                    method: 'DELETE'//En el metodo de delete
                }
            );
            if (response.ok) {//Si la operacion se realizo con exito 
                await Swal.fire({//Devuelve una alerta de que la incidencia se borro correctamente
                    title: '¡Incidencia eliminada!',
                    text: 'La Bitacora se eliminó correctamente',
                    icon: 'success',
                    width: '280px',

                    confirmButtonText: 'OK',
                    confirmButtonColor: '#855597'
                });
                location.reload();//Recarga la pagina
            } else {//Si no es exitoso devuelce una alerta avisando al usuario que no se pude eliminar la incidencia
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la Bitacora',
                    icon: 'error',
                    width: '280px',

                    confirmButtonText: 'OK',
                    confirmButtonColor: '#855597'
                });
            }
        } catch (error) {

            console.error('Error al eliminar Bitacora:', error);

            await Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al eliminar la Bitacora',
                icon: 'error',
                width: '280px',
                confirmButtonText: 'OK',
                confirmButtonColor: '#855597'
            });
        }
    } else {
        await Swal.fire({
            title: 'Cancelado',
            text: 'La Bitacora no fue eliminada',
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



