// Inicializar iconos de Lucide al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    obtenerIdLab();
    configurarBotonAdd();//cargar el boton para agregar material
    lucide.createIcons();
    cargarMaterial();
});
/*SECCION DE LA NAVEGACION DE LA PAGINA */
/*SECCION DE LOS PROCESOS DE LA PAGINA */
// Configurar el botón de "Agregar" para abrir el modal
function configurarBotonAdd() {
    const modal = document.getElementById('modal-crear-material');

    // En lugar de escuchar al botón, escuchamos al contenedor (que nunca desaparece)
    document.getElementById('material-container').addEventListener('click', (e) => {
        // Buscamos si lo que se clickeó es la card-add o algo dentro de ella
        const btnAdd = e.target.closest('#btn-abrir-modal-add');

        if (btnAdd) {
            console.log("Abriendo modal...");
            modal.style.display = 'flex';
        }
    });
}

//------------------------ FUNCIONES PRINCIPALES ----------------------
/*Esta funcion debe obtener del id del laboratorio que se encuentra logeado actualmente*/
// --- 0. FUNCIÓN DE CONTROL DE SESIÓN ---
// Aseguramos el uso de la función síncrona que frena cualquier acción sin sesión
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

//--------------------------MODAL DE CREAR--------------------------

// Guardar MATERIAL (POST a la API)
const modal = document.getElementById("modal-crear-material");
const btnCerrar = document.querySelector(".close-modal-crear");
btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
});
// Cerrar modal si se hace click fuera de la ventana blanca
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

//cerrar el modal de editar al dar click en la X
const btnCerrarEditar = document.querySelector(".close-modal-editar");
btnCerrarEditar.addEventListener("click", () => {
    modalEditar.style.display = "none";
});
// Cerrar modal si se hace click fuera de la ventana blanca
const modalEditar = document.getElementById("modal-editar-material");
window.addEventListener("click", (event) => {
    if (event.target == modalEditar) {
        modalEditar.style.display = "none";
    }
});

//no permitir que cantidad sea negativa
document.getElementById('cantidad-material').addEventListener('input', (e) => {
    if (e.target.value <= 0) e.target.value = 1;
});


// Enviar a la base de datos al dar click en "Guardar" la informacion que hay en los inputs del modal
//METODO DE CREAR MANTERIAL (POST)
document.getElementById('btn-confirmar-guardar').addEventListener('click', async () => {
    try {
        // 1. Obtener el ID del laboratorio activo desde el selector global
        const idLaboratorioActivo = obtenerIdLab();

        // 2. Capturar los campos de texto del material
        const nombreInput = document.getElementById('nombreCrear');
        const cantidadInput = document.getElementById('cantidad-material');
        const urlInput = document.getElementById('editar-url-img'); // Input de texto de la URL

        const nombre = nombreInput ? nombreInput.value.trim() : "";
        const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;
        const urlTexto = urlInput ? urlInput.value.trim() : "";

        // 3. Capturar el archivo físico del uploader de archivos
        const fileInput = document.getElementById('file-uploader-editar');
        const archivoFisico = fileInput ? fileInput.files[0] : null;

        // Validación veloz de seguridad en el front
        if (!nombre) {
            Swal.fire('Atención', 'El nombre del material es obligatorio.', 'warning');
            return;
        }

        // 4. Construir el FormData empacando todo para Multipart
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('cantidad', cantidad);
        formData.append('id_lab', idLaboratorioActivo);

        // Si hay archivo físico lo mandamos prioritariamente; si no, mandamos la URL de texto
        if (archivoFisico) {
            formData.append('imagen', archivoFisico); // El backend lo recibirá y renombrará con el valor de 'nombre'
        } else if (urlTexto && !urlTexto.startsWith('[Archivo Local]')) {
            formData.append('url_texto', urlTexto);
        }

        // 5. Enviar la petición única al servidor Flask
        const response = await fetch('http://127.0.0.1:5000/api/materiales', {
            method: 'POST',
            body: formData  // Al usar FormData, el navegador asigna el Content-Type correcto automáticamente
        });

        const result = await response.json();

        if (response.ok) {
            // Obtener el nombre semántico de la categoría para el SweetAlert
            const infoLab = await obtenerNombreLab();
            const categoria = infoLab ? infoLab.categoria : 'Inventario';

            await Swal.fire({
                title: '¡Material Agregado!',
                text: `El registro se asoció correctamente al laboratorio de ${categoria}`,
                icon: 'success',
                width: '300px',
                confirmButtonText: 'ok',
                confirmButtonColor: '#b189d7'
            });

            // 6. Limpieza profunda y estética del formulario tras guardar con éxito
            if (nombreInput) nombreInput.value = "";
            if (cantidadInput) cantidadInput.value = "1";
            if (urlInput) urlInput.value = "";
            if (fileInput) fileInput.value = ""; // Resetea el file uploader de raíz

            const previewBox = document.getElementById('editar-material-preview');
            const previewPlaceholder = document.getElementById('preview-placeholder');
            if (previewBox) previewBox.style.backgroundImage = 'none';
            if (previewPlaceholder) previewPlaceholder.style.display = 'flex';

            // 7. Cerrar el modal limpiamente removiendo estilos o displays
            const modalElement = document.getElementById('modal-crear-material');
            if (modalElement) {
                modalElement.style.display = 'none'; // Cierre consistente
                modalElement.classList.remove('active');
            }

            // 8. Actualizar las tarjetas del frontend reactivamente en lugar de recargar la pestaña entera
            if (typeof cargarMaterial === 'function') {
                cargarMaterial();
            }

        } else {
            Swal.fire('Error del servidor', result.error || 'No se pudo guardar el registro', 'error');
        }
    } catch (error) {
        console.error("Proceso de guardado interrumpido:", error.message);
        Swal.fire('Error', 'No se pudo conectar con el servidor backend', 'error');
    }
});
/*Funcion para cargar materiales */

// Captura de elementos
const previewBox = document.getElementById('editar-material-preview');
const fileUploader = document.getElementById('file-uploader-editar');
const urlInput = document.getElementById('editar-url-img');
const previewPlaceholder = document.getElementById('preview-placeholder');

// --- FLUJO 1: CARGAR ARCHIVO LOCAL ---

// 1. Al hacer clic en la preview-box, simulamos el clic en el input file
previewBox.addEventListener('click', (e) => {
    // Evitamos que se dispare si se hace clic en el texto del ID por accidente
    if (e.target.id !== 'display-edit-id') {
        fileUploader.click();
    }
});

// 2. Escuchar cuando se selecciona una imagen del dispositivo
fileUploader.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const base64Image = e.target.result;

            // Renderizamos la imagen como fondo de la preview-box
            previewBox.style.backgroundImage = `url('${base64Image}')`;

            // Ocultamos el icono de Lucide para que no estorbe la vista previa
            previewPlaceholder.style.display = 'none';

            // Opcional: Colocamos un texto indicativo o el nombre del archivo en el input de texto
            urlInput.value = `[Archivo Local] ${file.name}`;
        };

        reader.readAsDataURL(file);
    }
});

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

                <button class="btn-edit-card" onclick="montareditarMaterial(${m.IdMaterial}, event)">
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
            container.appendChild(card);
        });

        lucide.createIcons();

    } catch (error) {
        console.error("Error al conectar con la API de Stocker Lab:", error);
    }
}


/* ==========================================
   ACTUALIZAR MATERIALES (Stocker_Lab)
   ========================================== */

// 1. FUNCIÓN PARA CARGAR LOS DATOS EN EL MODAL AL HACER CLIC EN EDITAR
async function montareditarMaterial(id, event) {

    // Evitar propagación
    if (event) {
        event.stopPropagation();
    }

    console.log("Editando material en Stocker_Lab con ID:", id);

    // Modal
    const modal =
        document.getElementById('modal-editar-material');

    try {

        // Mostrar modal
        if (modal) {
            modal.style.display = 'flex';
        }

        // ============================================
        // FETCH
        // ============================================

        const response = await fetch(
            `http://127.0.0.1:5000/api/materiales/${id}`
        );

        const material = await response.json();

        // ============================================
        // VALIDAR RESPUESTA
        // ============================================

        if (response.ok && material) {

            console.log("Material recibido:", material);

            // ============================================
            // CAMPOS
            // ============================================

            // Nombre
            document.getElementById('nombreEditar').value =
                material.Nombre_Material || "";

            // Cantidad
            document.getElementById('editar-cantidad').value =
                material.Cantidad || 0;

            // ============================================
            // INPUT IMAGEN
            // ============================================

            const inputImg =
                document.getElementById('editar-url-img');

            if (inputImg) {

                // Mostrar solo nombre archivo
                const nombreArchivo =
                    material.Ruta_Imagen
                        ? material.Ruta_Imagen.split('/').pop()
                        : "";

                inputImg.value = nombreArchivo;

            }

            // ============================================
            // PREVIEW IMAGEN
            // ============================================

            const preview =
                document.getElementById('preview-placeholder');

            if (preview) {

                // Si existe imagen
                if (material.Ruta_Imagen) {

                    // Ruta correcta
                    const rutaImagen =
                        `http://127.0.0.1:5000/${material.Ruta_Imagen}`;

                    console.log(rutaImagen);

                    preview.innerHTML = `
                        <img 
                            src="${rutaImagen}"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                                border-radius:20px;
                            "
                        >
                    `;

                }

                // Si no hay imagen
                else {

                    preview.innerHTML = `
                        <i 
                            data-lucide="image"
                            style="height: 50px; width: 50px;"
                        ></i>
                    `;

                }

            }
            // ============================================
            // ID VISUAL
            // ============================================

            const txtDisplayId =
                document.getElementById('display-edit-id');

            if (txtDisplayId) {

                txtDisplayId.textContent =
                    `id: ${id}`;

            }

            // ============================================
            // INPUT HIDDEN
            // ============================================

            const inputId =
                document.getElementById('edit-material-id');

            if (inputId) {

                inputId.value = id;

            }

        }

        // ============================================
        // ERROR RESPUESTA
        // ============================================

        else {

            console.error(
                "No se pudieron obtener datos válidos:",
                material
            );

        }

    } catch (error) {

        console.error(
            "Error al cargar los datos del material:",
            error
        );

    }

}

// 2. EVENTO PARA CONFIRMAR LA EDICIÓN (Petición PUT Unificada)
document.getElementById('btn-confirmar-editar').addEventListener('click', async () => {
    // Recuperar el ID del material guardado en el input hidden
    const materialId = document.getElementById('edit-material-id').value;
    const inputUrlImg = document.getElementById('editar-url-img');
    const urlImg = inputUrlImg ? inputUrlImg.value.trim() : "";

    if (!materialId) {
        Swal.fire('Error', 'No se encontró el ID del material a actualizar', 'error');
        return;
    }

    // Capturar y limpiar los valores actuales del formulario
    const nombreMaterial = document.getElementById('nombreEditar').value.trim();
    const cantidadMaterial = parseInt(document.getElementById('editar-volumen').value) || 0;

    // Validación veloz en el Frontend
    if (!nombreMaterial) {
        Swal.fire('Atención', 'El campo Nombre es obligatorio', 'warning');
        return;
    }

    // Armamos el JSON mapeando los datos a las propiedades PascalCase que espera la DB a través de Flask
    const materialData = {
        Nombre_Material: nombreMaterial,
        Cantidad: cantidadMaterial,
        Ruta_Imagen: urlImg,
        IdLaboratorio: obtenerIdLab() // Mantiene la segmentación multi-tenant del laboratorio activo
    };

    try {
        // Al vivir todo en la misma tabla, un solo PUT actualiza datos e imagen de un solo golpe
        let response = await fetch(`http://127.0.0.1:5000/api/materiales/${materialId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialData)
        });

        if (response.ok) {
            await Swal.fire({
                title: '¡Actualizado!',
                text: 'El material se actualizó con éxito',
                icon: 'success',
                confirmButtonColor: '#b189d7'
            });

            // Cerrar el modal limpiamente restableciendo su display
            const modal = document.getElementById('modal-editar-material');
            if (modal) modal.style.display = 'none';

            // Refrescar el grid de tarjetas reactivamente sin recargar la pestaña entera
            if (typeof cargarMaterial === 'function') {
                cargarMaterial();
            }
        } else {
            const errorData = await response.json();
            Swal.fire('Error', errorData.error || 'No se pudieron guardar los cambios en el servidor', 'error');
        }
    } catch (error) {
        console.error("Error global al intentar guardar la edición:", error);
        Swal.fire('Error', 'No se pudo conectar con el servidor de Flask', 'error');
    }
});

/*ELIMINAR MATERIAL */


