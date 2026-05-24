// Inicializar iconos de Lucide al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarMangas();
    configurarBotonAdd();
    lucide.createIcons();
});


// Configurar el botón de "Agregar" para abrir el modal
function configurarBotonAdd() {
    const modal = document.getElementById('modal-crear-manga');

    // En lugar de escuchar al botón, escuchamos al contenedor (que nunca desaparece)
    document.getElementById('mangas-container').addEventListener('click', (e) => {
        // Buscamos si lo que se clickeó es la card-add o algo dentro de ella
        const btnAdd = e.target.closest('#btn-abrir-modal-add');

        if (btnAdd) {
            console.log("Abriendo modal...");
            modal.style.display = 'flex';
            cargarEditorialescrear();
        }
    });
}

//------------------------ FUNCIONES PRINCIPALES ----------------------
// Función para cargar mangas desde la API y mostrarlos en el DOM
async function cargarMangas() {
    try {
        // Llamada al endpoint que ya incluye el LEFT JOIN con manga_imagenes
        const response = await fetch('http://127.0.0.1:5000/mangas');
        const mangas = await response.json();

        const container = document.getElementById('mangas-container');

        // Mantenemos solo el botón de "Agregar" y limpiamos el resto
        const btnAddHtml = `
            <div class="card-add" id="btn-abrir-modal-add">
                <div class="inner-add" style="width: 190px; height: 235px; display: flex; align-items: center; justify-content: center; margin-top: 1px;">
                    <i data-lucide="book-plus" style=" width: 50px; height: 50px; color: #acb0be;"></i>
                </div>
                <span style="margin-top: 10px; font-weight: bold;">Agregar</span>
            </div>
        `;
        container.innerHTML = btnAddHtml;

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
                         class="manga-img" 
                         alt="Portada de ${m.titulo}"
                         onerror="this.src='img/default.png'">
                    <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s  </span>

                    <button class="btn-edit-card" onclick="montareditarManga(${m.id},event)">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-delete-card"onclick="eliminarManga(${m.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="manga-info">
                    <h3>${m.titulo} Vol ${m.volumen}</h3>
                    <p>${m.autor}</p>
                    <div class="price-tag">
                        <i data-lucide="dollar-sign"></i>
                        <span>$${m.precio.toFixed(2)}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Refrescar iconos para las nuevas tarjetas inyectadas
        lucide.createIcons();

    } catch (error) {
        console.error("Error al conectar con la API de MangaStore:", error);
    }
}

//-------------------NAVEGACIÓN-------------------
const btnInicio = document.getElementById('pp-nav');
btnInicio.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../pp/pp.html';
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

//-------------------BUSCADOR-------------------

//Buscar Manga por Nombre, Autor o ID (GET a la API)
const btnBuscarManga = document.getElementById('btn-search-manga')
btnBuscarManga.addEventListener('click', () => {
    buscarManga();
});
async function buscarManga() {
    const tipoFiltro = document.getElementById('tipo-filtro').value;
    const valor = document.getElementById('input-busqueda').value.trim();
    const container = document.getElementById('mangas-container');

    if (valor === "") {
        cargarMangas();
        return;
    }

    // Construir la URL correcta según tu API
    let url = "";
    if (tipoFiltro === 'id') {
        url = `http://127.0.0.1:5000/mangas/${valor}`;
    } else if (tipoFiltro === 'nombre') {
        url = `http://127.0.0.1:5000/mangas/nombre/${valor}`;
    } else if (tipoFiltro === 'autor') {
        url = `http://127.0.0.1:5000/mangas/autor/${valor}`;
    }
        console.log("Buscando en:", url);
    try {
        const respuesta = await fetch(url);
        container.innerHTML = ""; // Limpiamos siempre antes de procesar

        if (respuesta.ok) {
            let datos = await respuesta.json();

            const mangas = Array.isArray(datos) ? datos : [datos];

            if (mangas.length > 0 && mangas[0] !== null) {
                mangas.forEach(m => {
                    // Validamos que el objeto tenga datos (por si el API manda [null])
                    if(!m.id) return; 

                    const card = document.createElement('div');
                    card.className = 'manga-card';
                    card.innerHTML = `
                        <div class="card-top">
                            <span class="id-badge">${m.id}</span>   
                            <span class="editorial-label">Editorial ${m.id_editorial}</span>
                            <img src="${m.url_imagen || 'img/default.png'}" 
                                 class="manga-img" 
                                 alt="Portada de ${m.titulo}"
                                 onerror="this.src='img/default.png'">
                            <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s </span>

                            <button class="btn-edit-card" onclick="montareditarManga(${m.id}, event)">
                                <i data-lucide="pencil"></i>
                            </button>
                            <button class="btn-delete-card" onclick="eliminarManga(${m.id})">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                        <div class="manga-info">
                            <h3>${m.titulo} Vol ${m.volumen}</h3>
                            <p>${m.autor}</p>
                            <div class="price-tag">
                                <i data-lucide="dollar-sign"></i>
                                <span>$${m.precio.toFixed(2)}</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });

                // Renderizar iconos
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            } else {
                container.innerHTML = `<p class="no-results">No se encontraron resultados para "${valor}"</p>`;
            }
        } else {
            container.innerHTML = `<p class="no-results">No se encontraron resultados para "${valor}"</p>`;
        }
    } catch (error) {
        console.error("Error al buscar:", error);
        Swal.fire('Error', 'No se pudo realizar la búsqueda', 'error');
    }
}

//--------------------------MODAL DE CREAR--------------------------
//  Cargar Editoriales desde  API
async function cargarEditorialescrear() {
    try {
        const response = await fetch('http://127.0.0.1:5000/editoriales');
        const editoriales = await response.json();
        const select = document.getElementById('select-editorial');

        select.innerHTML = editoriales.map(e =>
            `<option value="${e.id}">${e.nombre}</option>`
        ).join('');
    } catch (error) {
        console.error("Error cargando editoriales", error);
    }
}

// Probar Imagen (El botón del taladro) para nuevo manga
document.getElementById('btn-probar-img').addEventListener('click', () => {
    const url = document.getElementById('nuevo-url-img').value;
    const preview = document.getElementById('nuevo-manga-preview');
    if (url) {
        preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
    }
});

// Guardar Manga (POST a la API)
const modal = document.getElementById("modal-crear-manga");
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
const modalEditar = document.getElementById("modal-editar-manga");
window.addEventListener("click", (event) => {
    if (event.target == modalEditar) {
        modalEditar.style.display = "none";
    }
});

//no permitir que volumen, precio o stock sean negativos
document.getElementById('nuevo-volumen').addEventListener('input', (e) => {
    if (e.target.value <= 0) e.target.value = 1;
});
document.getElementById('nuevo-precio').addEventListener('input', (e) => {
    if (e.target.value < 0) e.target.value = 0;
});
document.getElementById('nuevo-stock').addEventListener('input', (e) => {
    if (e.target.value <= 0) e.target.value = 1;
});

//mostrar imagen al dar click en el  ojo del modal
document.getElementById('btn-probar-img').addEventListener('click', () => {
    const url = document.getElementById('nuevo-url-img').value;
    const preview = document.getElementById('nuevo-manga-preview');
    preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
});

// Enviar a la base de datos al dar click en "Guardar" la informacion que hay en los inputs del modal
//METODO DE CREAR MANGA (POST)
document.getElementById('btn-confirmar-guardar').addEventListener('click', async () => {
    const mangaData = {
        titulo: document.getElementById('nombreCrear').value,
        autor: document.getElementById('nuevo-autor').value,
        volumen: parseFloat(document.getElementById('nuevo-volumen').value),
        precio: parseFloat(document.getElementById('nuevo-precio').value),
        stock: parseInt(document.getElementById('nuevo-stock').value),
        id_editorial: parseInt(document.getElementById('select-editorial').value)
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/mangas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mangaData)
        });

        const result = await response.json();

        if (response.ok) {
            // Mostrar el ID que devolvió la BD
            console.log("ID del manga creado:", result.id);
            const urlImg = document.getElementById('nuevo-url-img').value;
            if (urlImg) {
                await fetch('http://127.0.0.1:5000/mangas/imagenes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ manga_id: result.id, url_imagen: urlImg })
                });
            }

            await Swal.fire({
                title: '¡Manga Agregado!',
                text: 'El registro se guardó correctamente',
                icon: 'success',
                width: '280px',
                confirmButtonText: 'ok',
                confirmButtonColor: '#b189d7'
            });
            // Reemplaza 'modalCrear' por el ID real del modal
            const modalElement = document.getElementById('modalCrear');
            if (modalElement) {
                const modalBootstrap = bootstrap.Modal.getInstance(modalElement);
                if (modalBootstrap) {
                    modalBootstrap.hide();
                }
            }

            // Recargar la página para ver los cambios
            location.reload();

        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
});

//--------------------------MODAL DE EDITAR--------------------------
//para editar manga, el botón del taladro del modal editar
document.getElementById('btn-probar-img-editar').addEventListener('click', () => {
    const url = document.getElementById('editar-url-img').value;
    const preview = document.getElementById('editar-manga-preview');
    if (url) {
        preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
    }
});
// Función para abrir modal editar
async function montareditarManga(id, event) {
    if (event) event.stopPropagation(); // Detener la propagación del evento
    console.log("Editando manga lolo con ID:", id);
    const modal = document.getElementById('modal-editar-manga');

    try {
        // Mostrar el modal y cargar las editoriales primero
        modal.style.display = 'flex';
        await cargarEditorialeseditar();

        // Consultar los datos del manga específico
        const response = await fetch(`http://127.0.0.1:5000/mangas/${id}`);
        const manga = await response.json();

        if (response.ok) {
            // Rellenar los campos del modal con los datos de la DB
            document.getElementById('nombreEditar').value = manga.titulo;
            document.getElementById('editar-autor').value = manga.autor;
            document.getElementById('editar-volumen').value = manga.volumen;
            document.getElementById('editar-precio').value = manga.precio;
            document.getElementById('editar-stock').value = manga.stock;
            document.getElementById('editar-url-img').value = manga.url_imagen || "";
            const btnProbar = document.getElementById('btn-probar-img-editar');
            if (btnProbar) {
                btnProbar.click(); // Esto simula que el usuario le picó al ojo xd
            }
   
            const selectEdit = document.getElementById('select-editorial-editar');
            const nombreBusca = manga.id_editorial; // Aquí viene el nombre desde Python

            if (selectEdit && nombreBusca) {
                // Recorremos las opciones para encontrar la que coincida con el nombre
                for (let i = 0; i < selectEdit.options.length; i++) {
                    // .trim() elimina espacios accidentales al inicio o final
                    if (selectEdit.options[i].text.trim() === nombreBusca.trim()) {
                        selectEdit.selectedIndex = i;
                        break;
                    }
                }
            }
            // Guardamos el ID en un lugar oculto para saber que estamos EDITANDO y no CREANDO
            const inputId = document.getElementById('edit-manga-id');
            if (inputId) inputId.value = id;

        }
    } catch (error) {
        console.error("Error en la carga:", error);
    }
}

// Función para eliminar un manga (con confirmación)
async function eliminarManga(id) {
    const result = await Swal.fire({
        title: 'Seguro que quieres eliminar este manga?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        width: '280px',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#b189d7',
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#b189d7'
    });
    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/mangas/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await Swal.fire({
                    title: '¡Manga Eliminado!',
                    text: 'El registro se eliminó correctamente',
                    icon: 'success',
                    width: '280px',
                    confirmButtonText: 'ok',
                    confirmButtonColor: '#b189d7'
                });
                location.reload();
            } else {
                alert("Error al eliminar el manga");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    } else {
        await Swal.fire({
            title: '¡Cancelado!',
            text: 'El manga no fue eliminado',
            icon: 'error',
            width: '280px',
            confirmButtonText: 'ok',
            confirmButtonColor: '#b189d7'
        });
    }


}
// Función para cargar editoriales en el select del modal editar
async function cargarEditorialeseditar() {
    try {
        const response = await fetch('http://127.0.0.1:5000/editoriales');
        const editoriales = await response.json();
        const select = document.getElementById('select-editorial-editar');

        select.innerHTML = editoriales.map(e =>
            `<option value="${e.id}">${e.nombre}</option>`
        ).join('');
    } catch (error) {
        console.error("Error cargando editoriales", error);
    }
}

// Función para confirmar edición (PUT a la API)
document.getElementById('btn-confirmar-editar').addEventListener('click', async () => {
    const mangaId = document.getElementById('edit-manga-id').value;
    const urlImg = document.getElementById('editar-url-img').value; // Definimos la variable urlImg

    if (!mangaId) {
        Swal.fire('Error', 'No se encontró el ID', 'error');
        return;
    }

    const mangaData = {
        titulo: document.getElementById('nombreEditar').value,
        autor: document.getElementById('editar-autor').value,
        volumen: parseFloat(document.getElementById('editar-volumen').value),
        precio: parseFloat(document.getElementById('editar-precio').value),
        stock: parseInt(document.getElementById('editar-stock').value),
        id_editorial: parseInt(document.getElementById('select-editorial-editar').value)
    };

    try {
        //Actualizar datos generales del Manga
        let resManga = await fetch(`http://127.0.0.1:5000/mangas/${mangaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mangaData)
        });

        if (resManga.ok) {
            // Verificar si la imagen ya existe en la DB
            // Hacemos un GET simple.
            let resVerificar = await fetch(`http://127.0.0.1:5000/mangas/imagenes/${mangaId}`);
            
            let resImg;

            if (resVerificar.ok) {
                // Si el GET fue exitoso (200), la imagen EXISTE -> Usamos PUT
                console.log("La imagen existe, actualizando...");
                resImg = await fetch(`http://127.0.0.1:5000/mangas/imagenes/${mangaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url_imagen: urlImg })
                });
            } else if (resVerificar.status === 404) {
                // Si el GET devolvió 404, la imagen NO EXISTE -> Usamos POST
                console.log("La imagen no existe, creando nuevo registro...");
                resImg = await fetch(`http://127.0.0.1:5000/mangas/imagenes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        manga_id: parseInt(mangaId), 
                        url_imagen: urlImg 
                    })
                });
            }

            // Verificar resultado final de la operación de imagen
            if (resImg && resImg.ok) {
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: 'Manga e imagen procesados con éxito',
                    icon: 'success',
                    confirmButtonColor: '#b189d7'
                });
                location.reload();
            } else {
                Swal.fire('Atención', 'Se actualizó el manga, pero hubo un problema con la imagen', 'warning');
            }
        } else {
            Swal.fire('Error', 'No se pudieron actualizar los datos del manga', 'error');
        }
    } catch (error) {
        console.error("Error global:", error);
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
});



