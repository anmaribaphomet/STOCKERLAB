// Inicializar iconos de Lucide al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    obtenerIdLab();
    const nombreUsuario = obtenerNombreUsuario(); // Obtiene el nombre o redirige
    const elementoHeader = document.getElementById('txt-usuario-header');
    if (elementoHeader) {
        elementoHeader.textContent = nombreUsuario;
    }

    // --- LOGICA DEL SEMÁFORO DEL SERVIDOR ---
    verificarServidor(); // Primera revisión al cargar
    setInterval(verificarServidor, 30000); // Revisa el estado automáticamente cada 30 segundos
    configurarBotonAdd();//cargar el boton para agregar material
    lucide.createIcons();
    cargarMaterial();
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
//a inicio
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

/*SECCION DE LA NAVEGACION DE LA PAGINA */
/*SECCION DE LOS PROCESOS DE LA PAGINA */
// Configurar el botón de "Agregar" para abrir el modal
function configurarBotonAdd() {
    const modal = document.getElementById('Form-materiales');

    // En lugar de escuchar al botón, escuchamos al contenedor (que nunca desaparece)
    document.getElementById('material-container').addEventListener('click', (e) => {
        // Buscamos si lo que se clickeó es la card-add o algo dentro de ella
        const btnAdd = e.target.closest('#btn-abrir-modal-add');
        if (btnAdd) {
            console.log("Abriendo modal...");
            modal.style.display = 'flex';
            mapForm('agregar'); // Cargar el formulario de agregar
        }
    });
}

//------------------------ FUNCIONES PRINCIPALES ----------------------
// Aseguramos el uso de la función síncrona que frena cualquier acción sin sesión
function obtenerIdLab() {
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
async function obtenerNombreLab() {
    const idLaboratorioActual = obtenerIdLab();
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/laboratorios/${idLaboratorioActual}`);
        const laboratorio = await response.json();

        if (response.ok) {
            return laboratorio;
        } else {
            console.error("Error en la respuesta de la API:", laboratorio.mensaje);
            return null;
        }
    } catch (error) {
        console.error("Error cargando Laboratorio", error);
    }
}

/* Funcion para agregar los materiales */

//--------------------------MAPEO DE LAS CARD CON LOS MATERIALES--------------------------

async function cargarMaterial() {
    try {
        const idActual = obtenerIdLab();
        const response = await fetch(`http://127.0.0.1:5000/api/materiales/laboratorio/${idActual}`);
        const materiales = await response.json();
        const { categoria } = (await obtenerNombreLab()) || { categoria: 'Inventario' };

        // CORRECCIÓN PREVENTIVA: Si Flask responde un error (objeto), evitamos el colapso del forEach
        if (!Array.isArray(materiales)) {
            console.error("Error desde el servidor Flask:", materiales.error);
            return;
        }

        const container = document.getElementById('material-container');
        if (!container) return; // Protección por si no encuentra el contenedor

        const btnAddHtml = `
            <div class="card-add" id="btn-abrir-modal-add">
                <div class="inner-add" style="width: 190px; height: 235px; display: flex; align-items: center; justify-content: center; margin-top: 1px;">
                    <i data-lucide="book-plus" style="width: 50px; height: 50px; color: #acb0be;"></i>
                </div>
                <span style="margin-top: 10px; font-weight: bold;">Agregar</span>
            </div>
        `;
        container.innerHTML = btnAddHtml;

        materiales.forEach(m => {
            const card = document.createElement('div');
            card.className = 'material-card';

            const rutaPortada = m.Ruta_Imagen ? m.Ruta_Imagen : 'static/uploads/default.png';

            card.innerHTML = `
                <div class="card-top">
                    <span class="id-badge">ID: ${m.IdMaterial}</span>   
                    
                    <img src="../${rutaPortada}" 
                         class="material-img" 
                         alt="Imagen de ${m.Nombre_Material}"
                         onerror="this.src='img/default.png'">
                    
                    <span class="stock-label"> 
                        <i data-lucide="package"></i> ${m.Cantidad} Disponible/s
                    </span>
                </div>

                <button class="btn-edit-card" >
                        <i data-lucide="pencil"></i>
                </button>
                <button class="btn-delete-card" onclick="eliminarMaterial(${m.IdMaterial})">
                    <i data-lucide="trash-2"></i>
                </button>
                <div class="material-info">
                    <h3>${m.Nombre_Material}</h3>
                    <p>Laboratorio de ${categoria}</p>
                    <p style="color: #6c757d; font-size: 14px; margin-top: 5px;">
                        Cantidad total: <strong>${m.Cantidad}</strong> u.
                    </p>
                </div>
            `;

            const btnActualizar = card.querySelector('.btn-edit-card');
            btnActualizar.addEventListener('click', () => {
                actualizarMaterial(m);
            });
            container.appendChild(card);
        });

        lucide.createIcons();

    } catch (error) {
        console.error("Error al conectar con la API de Stocker Lab:", error);
    }
}


//-------------------------ACCIONES DENTRO DEL FORM-EDITAR CREAR-----------------------

function actualizarMaterial(material) {
    mapForm('editar', material);
}
const btnCrear = document.getElementById('btnagregar');
//OBJETO QUE ALMACENARA LOS DATOS QUE CONSTITUYEN LA BITACORA MAT
let datosMateriales = {
    idMaterial: '',
    nombreMaterial: '',
    cantidad: 1,
    idLaboratorio: obtenerIdLab(),
    Ruta_Imagen: ''
};


async function mapForm(tipo, material = null) {//El form debe aceptar datos opciones 
    const siguienteId = await calcularSiguienteId();
    const contenedor = document.getElementById('Form-materiales');
    // SI ES EDICIÓN
    if (tipo === 'editar' && material) {

        datosMateriales = {
            idMaterial: material.IdMaterial,
            nombreMaterial: material.Nombre_Material,
            cantidad: material.Cantidad,
            idLaboratorio: material.IdLaboratorio,
            Ruta_Imagen: material.Ruta_Imagen

        };
    } else {
        // SI ES CREAR
        datosMateriales = {
            idMaterial: '',
            nombreMaterial: '',
            cantidad: 1,
            Ruta_Imagen: '',
            idLaboratorio: obtenerIdLab()
        };
    }

    if (tipo === 'agregar' || tipo === 'editar') {//que acceda a este componente ya sea para agregar o editar
        if (tipo === 'agregar') {
            datosMateriales = {
                idMaterial: '',
                nombreMaterial: '',
                cantidad: 1,
                idLaboratorio: obtenerIdLab(),
                Ruta_Imagen: ''

            };
        }

        contenedor.style.display = 'flex';

        /**NOTA : Los componentes del tipo input y demas al tratarse inicialmente de un form de agregar, deben ser modificados
         * para carguen datos que ya existen o reciban datos , dependiento el uso que se le de al componente
         */
        const nombreImagen = datosMateriales.Ruta_Imagen
            ? datosMateriales.Ruta_Imagen.split('/').pop()
            : '';
        contenedor.innerHTML = `
           <form id="form-actualizar" class="forms animate-pop">
                <button type="button" class="btn-cerrar-dinamico" id="cerrar-form-actualizar">
                    &times;
                </button>

                <div class="superior">
                    <h3>${tipo === 'editar' ? 'Editar Material' : 'Crear Material'}</h3>
                    
                <div class="MostrarId" id = "obtId">
                    ${tipo === 'editar' ? `ID: ${datosMateriales.idMaterial}` : `${siguienteId ? `ID: ${siguienteId}` : 'ID: -'}`}
                </div>
                </div>

                <div id="contenedor-Etapas-Forms" class="cont-Cards-Info">
                    <div id="primeraParte" class="cards-info-Mat">
                        <h3>
                            <div class="circulo">
                                <i data-lucide="Pin" style="color: white;"></i>
                            </div>
                            Datos
                        </h3>
                        <div class="form-materiales">
                            <Label>${tipo === 'editar' ? 'Actualizar Nombre' : 'Nombre'}<b style="color: red;" s>*</b></Label>
                            <input type="text" 
                                id="input-nombre"
                                placeholder="${tipo != 'editar' ? 'Nombre' : ''}"
                                value="${datosMateriales.nombreMaterial || ''}"
                                required autofocus>
                            <div class="linea"></div>
                            <label>${tipo === 'editar' ? 'Actualizar Cantidad' : 'Cantidad'}<b style="color: red;" s>*</b></label>
                            <input type="number" 
                                id="input-cantidad"
                                value="${datosMateriales.cantidad || 1}">
                        </div>


                    </div>

                    <div id="segundaParte" class="cards-info-Mat">
                        <h3>
                            <div class="circulo">
                                <i data-lucide="Pin" style="color: white;"></i>
                            </div>
                            Imagen
                        </h3>
                        <div class="form-materiales">
                            <div class = "eye" id ="verMas" >
                                <i data-lucide="eye"></i>
                            </div>
                            <div class="cargarImagen" id="editar-material-preview"
                                style="cursor: pointer; background-size: cover; background-position: center;">
                                <div id="preview-placeholder"
                                    style="display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="image" style="height: 50px; width: 50px;"></i>
                                </div>
                            </div>
                            <input type="file" id="file-uploader-editar" accept=".jpg, .jpeg, .png" style="display: none;">

                            <label>Imagen</label>
                           <input type="text" 
                            placeholder="${tipo != 'editar' ? 'Url Imagen' : ''}"
                            value="${nombreImagen}"
                            id="editar-url-img"
                            readonly>

                        </div>
                    </div>
                </div>
                <div class="cont-btns">
                    <button type="submit"
                            id="${tipo === 'editar' ? 'botonC-editar' : 'botonC-agregar'}"
                        >
                            ${tipo === 'editar' ? 'Actualizar Material' : 'Guardar'}
                    </button>
                    <button type="button" id="cancelar" class="btn-forms">Cancelar</button>
                </div>
            </form> 


            <!-- Modal para visor de imagen completa -->
            <div id="modal-visor-imagen" class="modal-visor" style="display: none;">
                <div class="modal-visor-contenido">

                    <button type="button" class="cerrar-visor-btn"  id="cerrar-visor">
                        &times;
                    </button>
                    <img id="imagen-completa-src" src="" alt="Vista completa">
                    
                </div>
            </div>
            
            `;

        lucide.createIcons();
        // Aquí llamas a tu método perfectamente
        inicializarVisorImagen();

        const btnCerrarPost = document.getElementById('cerrar-form-actualizar');
        btnCerrarPost.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });

        const btnCancelarPost = document.getElementById('cancelar');
        btnCancelarPost.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });


        const more = document.getElementById('verMas');
        more.addEventListener('click', () => { });

        const preview = document.getElementById('preview-placeholder');
        if (preview && tipo === 'editar') {
            // Si existe imagen
            if (datosMateriales.Ruta_Imagen) {
                // Ruta correcta
                const rutaImagen =
                    `http://127.0.0.1:5000/${datosMateriales.Ruta_Imagen}`;

                console.log(rutaImagen);
                preview.style.display = 'none';
                const previewBox = document.getElementById('editar-material-preview');
                previewBox.style.backgroundImage = `url('${rutaImagen}')`;

            }
        }

        const previewBox = document.getElementById('editar-material-preview');
        const fileUploader = document.getElementById('file-uploader-editar');
        const urlInput = document.getElementById('editar-url-img');
        const previewPlaceholder = document.getElementById('preview-placeholder');


        previewBox.addEventListener('click', () => {
            fileUploader.click();
        });


        fileUploader.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (!file) return; // Si el usuario cancela la selección, no hacemos nada

            // 1. Obtener la extensión del archivo y pasarla a minúsculas (.jpg, .png, etc.)
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            // 2. Definir la lista de extensiones permitidas
            const allowedExtensions = ['.jpg', '.jpeg', '.png'];

            // 3. Validar si la extensión está permitida
            if (!allowedExtensions.includes(fileExtension)) {
                Swal.fire({
                    title: 'Atención',
                    text: 'Formato no válido. Solo se permiten imágenes .jpg, .jpeg o .png',
                    icon: 'warning',
                    confirmButtonColor: '#8b5a96',
                    confirmButtonText: 'Entendido',
                    didOpen: () => {
                        // Fuerza el contenedor principal de SweetAlert al frente de todo
                        const container = Swal.getContainer();
                        if (container) {
                            container.style.zIndex = '999999';
                        }
                    }
                });

                // Limpiamos los inputs y el fondo por si había una imagen válida cargada antes
                fileUploader.value = '';
                urlInput.value = '';
                previewBox.style.backgroundImage = 'none';
                if (previewPlaceholder) previewPlaceholder.style.display = 'flex';

                return; // Cortamos la ejecución aquí
            }

            // --- Si pasa la validación, continúa tu flujo normal ---
            const reader = new FileReader();

            reader.onload = (e) => {
                const base64Image = e.target.result;
                previewBox.style.backgroundImage = `url('${base64Image}')`;

                if (previewPlaceholder) {
                    previewPlaceholder.style.display = 'none';
                }

                urlInput.value = `Name File: ${file.name}`;
            };

            reader.readAsDataURL(file);
        });

    }
}



function inicializarVisorImagen() {
    const more = document.getElementById('verMas');
    const previewBox = document.getElementById('editar-material-preview');
    const modalVisor = document.getElementById('modal-visor-imagen');
    const imagenCompletaSrc = document.getElementById('imagen-completa-src');
    const btnCerrarVisor = document.getElementById('cerrar-visor');

    if (!more || !previewBox || !modalVisor || !imagenCompletaSrc || !btnCerrarVisor) return;

    more.addEventListener('click', () => {
        const bgImage = previewBox.style.backgroundImage;

        if (bgImage && bgImage !== 'none') {
            const urlPura = bgImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
            imagenCompletaSrc.src = urlPura;
            modalVisor.style.display = 'flex';
        } else {
            Swal.fire({
                title: 'Atención',
                text: 'No hay ninguna imagen cargada para visualizar.',
                icon: 'warning',
                confirmButtonColor: '#8b5a96',
                confirmButtonText: 'Entendido',
                didOpen: () => {
                    // Fuerza el contenedor principal de SweetAlert al frente de todo
                    const container = Swal.getContainer();
                    if (container) {
                        container.style.zIndex = '999999';
                    }
                }
            });
        }
    });

    btnCerrarVisor.addEventListener('click', () => {
        modalVisor.style.display = 'none';
    });

    modalVisor.addEventListener('click', (e) => {
        if (e.target === modalVisor) {
            modalVisor.style.display = 'none';
        }
    });
}

// Función para calcular el siguiente ID disponible para mostrarlo en el formulario de creación.
async function calcularSiguienteId() {
    const IdEnUso = obtenerIdLab();
    try {
        const respuesta = await fetch(`http://localhost:5000/api/materiales/ultimo_id`); // Ruta que trae todas
        const ultimoId = await respuesta.json();

        if (respuesta.ok) {//si el servidor no obtiene nada va colocar un mensaje en la pantalla de que el id no fue encontrado
            const calcularSig = ultimoId !== null ? ultimoId + 1 : null;
            return calcularSig;
        } else {
            console.error("Error al obtener el último ID:", ultimoId.error);
            return null;
        }

    } catch (error) {
        console.error("Error al cargar IDs:", error);
    }
}


const contenedorForms = document.getElementById('Form-materiales');

contenedorForms.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Inputs
    const nombre = document.getElementById('input-nombre').value.trim();
    const cantidad = document.getElementById('input-cantidad').value;
    const imagen = document.getElementById('file-uploader-editar').files[0];

    // Validación simple
    if (!nombre) {
        Swal.fire({
            title: 'Error',
            text: 'El nombre es obligatorio',
            icon: 'error'
        });
        return;
    }

    // FormData para enviar imagen
    const formData = new FormData();

    formData.append('nombre', nombre);
    formData.append('cantidad', cantidad);
    formData.append('id_lab', obtenerIdLab());

    // Solo agregar imagen si existe
    if (imagen) {
        formData.append('imagen', imagen);
    }

    // Configuración por defecto
    let url = 'http://127.0.0.1:5000/api/materiales';
    let metodo = 'POST';

    // Detectar edición
    const esEditar = document.getElementById('botonC-editar');

    if (esEditar) {
        metodo = 'PUT';

        url = `http://127.0.0.1:5000/api/materiales/${datosMateriales.idMaterial}`;
    }

    try {

        const respuesta = await fetch(url, {
            method: metodo,
            body: formData
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {


            // Opcional: ocultar el formulario overlay
            const overlay = document.getElementById('Form-materiales');
            if (overlay) {
                overlay.style.display = 'none';
            }

            Swal.fire({
                title: '¡Éxito!',
                text: resultado.mensaje || 'Operación exitosa',
                icon: 'success',
                confirmButtonColor: '#8b5a96',
                target: document.body,
                customClass: {
                    container: 'swal-top-layer'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                }
            });

        } else {

            Swal.fire({
                title: 'Error',
                text: resultado.error || 'Ocurrió un problema',
                icon: 'error',
                confirmButtonColor: '#8b5a96',
                target: document.body,
                customClass: {
                    container: 'swal-top-layer'
                }
            });

        }

    } catch (error) {

        console.error(error);

        Swal.fire({
            title: 'Error',
            text: 'Error en la petición',
            icon: 'error'
        });

    }

});
//ELIMINAR MATERIAL
async function eliminarMaterial(id) {
    const result = await Swal.fire({
        title: '¿Seguro que quieres eliminar este material?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        width: '280px',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#b189d7',
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#b189d7'
    });

    if (!result.isConfirmed) {
        await Swal.fire({
            title: 'Cancelado',
            text: 'El material no fue eliminado',
            icon: 'info',
            width: '280px',
            confirmButtonColor: '#b189d7'
        });
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/materiales/${id}`,
            {
                method: 'DELETE'
            }
        );

        const data = await response.json();

        // Eliminación exitosa
        if (response.ok) {
            await Swal.fire({
                title: '¡Material eliminado!',
                text: data.mensaje || 'El material fue eliminado correctamente',
                icon: 'success',
                width: '280px',
                confirmButtonText: 'OK',
                confirmButtonColor: '#b189d7'
            });

            cargarMaterial(); // Mejor que location.reload()
            return;
        }

        // Conflicto por foreign key (bitácora)
        if (response.status === 409) {
            await Swal.fire({
                title: 'No se puede eliminar',
                text: data.mensaje || 'El material tiene registros asociados',
                icon: 'warning',
                width: '320px',
                confirmButtonColor: '#b189d7'
            });
            return;
        }

        // Otros errores
        await Swal.fire({
            title: 'Error',
            text: data.error || data.mensaje || 'Ocurrió un error inesperado',
            icon: 'error',
            width: '320px',
            confirmButtonColor: '#b189d7'
        });

    } catch (error) {
        console.error("Error al eliminar:", error);

        await Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            icon: 'error',
            width: '320px',
            confirmButtonColor: '#b189d7'
        });
    }
}

//SISTEMA DE FILTROS PARA BUSCAR POR NOMBRE , ID O CANTIDAD


//Buscar Material por Nombre, ID o Cantidad (GET a la API)
const btnBuscarMaterial = document.getElementById('btn-search-material')
btnBuscarMaterial.addEventListener('click', () => {
    buscarMaterial();
});
async function buscarMaterial() {
    const tipoFiltro = document.getElementById('tipo-filtro').value;
    const valor = document.getElementById('input-busqueda').value.trim();
    const container = document.getElementById('material-container');

    if (valor === "") {
        cargarMaterial();
        return;
    }

    let url = "";

    if (tipoFiltro === 'id') {
        url = `http://127.0.0.1:5000/api/materiales/laboratorio/${obtenerIdLab()}/${valor}`;
    } else if (tipoFiltro === 'nombre') {
        url = `http://127.0.0.1:5000/api/materiales/laboratorio/${obtenerIdLab()}/nombre/${valor}`;
    } else if (tipoFiltro === 'cantidad') {
        url = `http://127.0.0.1:5000/api/materiales/laboratorio/${obtenerIdLab()}/cantidad/${valor}`;
    }

    console.log("Buscando en:", url);

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        container.innerHTML = "";

        if (!respuesta.ok) {
            container.innerHTML = `
                <p class="no-results">
                    No se encontraron resultados para "${valor}"
                </p>
            `;
            return;
        }

        if (datos.error) {
            console.error(datos.error);
            container.innerHTML = `
                <p class="no-results">Error al cargar materiales</p>
            `;
            return;
        }

        const materiales = Array.isArray(datos) ? datos : [datos];

        if (!materiales.length) {
            container.innerHTML = `
                <p class="no-results">
                    No se encontraron resultados para "${valor}"
                </p>
            `;
            return;
        }

        const { categoria } = (await obtenerNombreLab()) || {
            categoria: 'Inventario'
        };

        materiales.forEach(m => {
            if (!m) return;

            const rutaPortada = m.Ruta_Imagen
                ? m.Ruta_Imagen
                : 'static/uploads/default.png';

            const card = document.createElement('div');
            card.className = 'material-card';

            card.innerHTML = `
                <div class="card-top">
                    <span class="id-badge">ID: ${m.IdMaterial}</span>

                    <img src="../${rutaPortada}" 
                        class="material-img" 
                        alt="Imagen de ${m.Nombre_Material}"
                        onerror="this.src='img/default.png'">

                    <span class="stock-label"> 
                        <i data-lucide="package"></i> ${m.Cantidad} Disponible/s
                    </span>
                </div>

                <button class="btn-edit-card">
                    <i data-lucide="pencil"></i>
                </button>

                <button class="btn-delete-card" onclick="eliminarMaterial(${m.IdMaterial})">
                    <i data-lucide="trash-2"></i>
                </button>

                <div class="material-info">
                    <h3>${m.Nombre_Material}</h3>
                    <p>Laboratorio de ${categoria}</p>
                    <p style="color: #6c757d; font-size: 14px; margin-top: 5px;">
                        Cantidad total: <strong>${m.Cantidad}</strong> u.
                    </p>
                </div>
            `;

            const btnActualizar = card.querySelector('.btn-edit-card');
            btnActualizar.addEventListener('click', () => {
                actualizarMaterial(m);
            });

            container.appendChild(card);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    } catch (error) {
        console.error("Error al buscar:", error);
        Swal.fire('Error', 'No se pudo realizar la búsqueda', 'error');
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