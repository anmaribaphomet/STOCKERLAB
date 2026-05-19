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

// Lógica para redireccionar a otras páginas
const btnInicio = document.getElementById('pp-nav');
btnInicio.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../pp/pp.html';
});

const btnMangas = document.getElementById('btn-nav-mangas');
btnMangas.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../catalogomangas/mangas.html';
});

const btnVenta = document.getElementById('btn-nav-ventas')

btnVenta.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../historialVentas/ventas.html';
});


//-------------------------------------------------SECCION DESTINADA A LA EDITORIAL-----------------------------------------------
function cargarEdit(editoriales) {
    const cuerpoTabla = document.querySelector('#tablaEditorial tbody');
    cuerpoTabla.innerHTML = ''; // Limpiamos la tabla antes de llenarla

    // Recorremos el JSON y creamos una fila por cada manga
    editoriales.forEach(editorial => {
        const fila = `<tr>
                <td>${editorial.id}</td>
                <td>${editorial.nombre}</td>
                <td>${editorial.pais}</td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarEditorial(${editorial.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>`;
        cuerpoTabla.innerHTML += fila;
    });

    lucide.createIcons();
}

// Función para obtener y mostrar los mangas
async function cargarEditorial() {
    // Solo ejecuta la lógica si el elemento existe en esta página
    const urlAPIEdt = 'http://127.0.0.1:5000/editoriales';
    try {
        // Hacemos la petición GET a la API
        const respuesta = await fetch(urlAPIEdt);
        const editoriales = await respuesta.json();
        cargarEdit(editoriales);
    } catch (error) {
        console.error("Error al cargar las editoriales:", error);
    }

}

// Ejecutamos la función al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarEditorial();

});
// Función para eliminar una editorial
async function eliminarEditorial(id) {
    const result = await Swal.fire({
        title: '¿Seguro que quieres eliminar esta editorial?',
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
            const response = await fetch(`http://127.0.0.1:5000/editoriales/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await Swal.fire({
                    title: '¡Editorial eliminada!',
                    text: 'El registro se eliminó correctamente',
                    icon: 'success',
                    width: '280px',
                    confirmButtonText: 'ok',
                    confirmButtonColor: '#b189d7'
                });

                location.reload();
            } else {
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la editorial',
                    icon: 'error',
                    confirmButtonColor: '#b189d7'
                });
            }

        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    } else {
        await Swal.fire({
            title: 'Cancelado',
            text: 'La editorial no fue eliminada',
            icon: 'error',
            width: '280px',
            confirmButtonText: 'ok',
            confirmButtonColor: '#b189d7'
        });
    }
}

/* SECCION DE BUSQUEDA DE EDITORIALES */

async function buscarEditoriales() {
    const tipoFiltro =
        document.getElementById('tipo-filtro').value;
    const valor =
        document.getElementById('input-busqueda')
            .value
            .trim();

    if (valor === '') {
        cargarEditorial();
        return;
    }
    let url = '';
    let tipo = '';
    let valorBusqueda = '';
    if (tipoFiltro == 'id') {
        valorBusqueda = parseInt(valor);
        tipo = 'Id';
        url = `http://127.0.0.1:5000/editoriales/${valorBusqueda}`;

    } else if (tipoFiltro == 'nombre') {
        valorBusqueda = valor.trim();
        tipo = 'Nombre';

        url = `http://127.0.0.1:5000/editoriales/nombre/${valorBusqueda}`;

    } else if (tipoFiltro == 'pais') {
        valorBusqueda = valor.trim();
        tipo = 'Pais';

        url = `http://127.0.0.1:5000/editoriales/pais/${valorBusqueda}`;
    }
    try {
        const respuesta = await fetch(url);


        if (!respuesta.ok) {

            const cuerpoTabla =
                document.querySelector('#tablaEditorial tbody');

            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="3" class="mensaje-error">
                        No se encontró ninguna editorial con ese ${tipo} , ${valorBusqueda}
                    </td>
                </tr>
            `;

            return;
        }

        const editoriales = await respuesta.json();

        if (Array.isArray(editoriales)) {
            cargarEdit(editoriales);
        } else {
            cargarEdit([editoriales]);
        }

    } catch (error) {
        console.error("Error en búsqueda:", error);
    }
}

// Agregar evento al botón de búsqueda
const search = document.getElementById('btn-buscar-filtro');
search.addEventListener('click', () => {
    console.log('Hola');
    buscarEditoriales();
});


//Formulario paea agregar una nueva editorial
function mapForm(tipo) {
    const contenedor = document.getElementById('Form');

    if (tipo === 'agregar') {
        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
            <form id="form-agregar" class="forms">
                <!-- Botón de cerrar integrado -->
                <button type="button" class="btn-cerrar-dinamico" id ="cerrar-form-agregar">
                    &times;
                </button>
                <h3>Registro de Editorial</h3>
                <input type="text" name="nombre" placeholder="Nombre" required autofocus>
                <input type="text" name="pais" placeholder="Pais" required autofocus>
                <button type="submit">Guardar Editorial</button>
            </form>
        `;

        const btnCerrarPost = document.getElementById('cerrar-form-agregar');
        btnCerrarPost.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });
    } else if (tipo === 'actualizar') {
        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
        <form id="form-actualizar" class="forms">
            <!-- Botón de cerrar integrado -->
                <button type="button" class="btn-cerrar-dinamico" id ="cerrar-form-actualizar">
                    &times;
                </button>
            <h3>Actualizar editorial</h3>
            
            <label>Selecciona el ID a modificar:</label>
            <select name="id_editorial" id="select-ids" class="select-int">
                <!-- Aquí se cargarán los IDs dinámicamente -->
                <option value="">Cargando...</option>
            </select>

            <input type="text" placeholder="Nuevo Nombre" name="nombre" id="inp-Nombre">
            <input type="text" placeholder="Nuevo Pais" name="pais"  id="inp-Pais">
            <button type="submit">Guardar</button>
        </form>
    `;

        // Llamamos a la funcion para cargar el combo de id
        cargarIdCombo();
        const btnCerrarUpdate = document.getElementById('cerrar-form-actualizar');
        btnCerrarUpdate.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });
    }
}


// Función para cargar el combo de IDs en el formulario de actualización
async function cargarIdCombo() {
    const select = document.getElementById('select-ids');
    const nom = document.getElementById('inp-Nombre');
    const pais = document.getElementById('inp-Pais');

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/editoriales'); // Ruta que trae todas
        const editoriales = await respuesta.json();

        select.innerHTML = '<option value="">Seleccione un ID</option>';

        // Creamos una opción por cada editorial
        editoriales.forEach(ed => {
            const opcion = document.createElement('option');
            opcion.value = ed.id; // El valor que se envía a Python
            opcion.textContent = `ID: ${ed.id} - ${ed.nombre}`; // Lo que ve el usuario
            select.appendChild(opcion);
        });

        // Agregamos el evento para detectar el cambio de selección y que cargue los datos asociados al id en los inputs
        select.addEventListener('change', (e) => {
            const idSeleccionado = e.target.value;

            // Buscamos la editorial que coincide con el ID seleccionado
            const editorialEncontrada = editoriales.find(ed => ed.id == idSeleccionado);

            if (editorialEncontrada) {
                // Llenamos los inputs con los datos encontrados
                nom.value = editorialEncontrada.nombre;
                pais.value = editorialEncontrada.pais;
            } else {
                // Limpiamos si no hay selección válida
                nom.value = "";
                pais.value = "";
            }
        });
    } catch (error) {
        console.error("Error al cargar IDs:", error);
    }
}


//Guardar el formulario
// Capturar el formulario
const contenedor = document.getElementById('Form');
if (contenedor) {
    // Escuchamos el evento submit en el contenedor padre
    contenedor.addEventListener('submit', async (e) => {//Se coloca un lsitener para detectar que formulario esta activo dentro del contenedor
        e.preventDefault(); // Detenemos la recarga de página

        // Identificamos cuál formulario se activó
        const formulario = e.target;//Te dice que formulario esta activo en el contenedor padre al momento de clickear guardar
        const idFormulario = formulario.id;// al ya tener un objeto de tipo formulario puedes leer sus atributos , en este caso el id.

        // Extraemos los datos dinámicamente
        const datosRaw = new FormData(formulario);
        const datos = Object.fromEntries(datosRaw.entries());

        // Definimos la URL según el formulario
        let url = 'http://127.0.0.1:5000/editoriales';
        let metodo = 'POST'; // Por defecto para agregar

        if (idFormulario === 'form-actualizar') {
            metodo = 'PUT';
            const idParaUrl = datos.id_editorial;
            url = `${url}/${idParaUrl}`;
            delete datos.id_editorial;
        }
        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (respuesta.ok) {
                const mensaje = resultado.mensaje || "Operación exitosa";

                // Usamos .then() para esperar a que el usuario cierre la alerta
                Swal.fire({
                    title: '¡Éxito!',
                    text: mensaje,
                    icon: 'success',
                    confirmButtonColor: '#8b5a96'
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
                    confirmButtonColor: '#8b5a96'
                });
            }

        } catch (error) {
            console.error("Error en la petición:", error);
        }
    });

}

