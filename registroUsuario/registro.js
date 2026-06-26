// Esperamos a que el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    cargarLaboratorios();

    const form = document.getElementById('form-usuario');

    if (form) {
        form.addEventListener('submit', registrarUsuario);
    }
});


// CARGAR LABORATORIOS EN COMBO
async function cargarLaboratorios() {
    const combo = document.getElementById('laboratorio-select');

    if (!combo) {
        console.error("No existe el select laboratorio-select");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/laboratorios');

        if (!response.ok) {
            throw new Error("No se pudieron obtener los laboratorios");
        }

        const laboratorios = await response.json();

        console.log("Laboratorios recibidos:", laboratorios);

        combo.innerHTML = `
            <option value="">Seleccione laboratorio</option>
        `;

        laboratorios.forEach(lab => {
            const option = document.createElement('option');

            option.value = lab.id;
            option.textContent =
                `${lab.categoria} | ${lab.edificio} - Salón ${lab.salon}`;

            combo.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando laboratorios:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los laboratorios',
            icon: 'error',
            confirmButtonColor: '#8b5a96',
            confirmButtonText: 'Entendido'
        });
    }
}


// REGISTRAR USUARIO
async function registrarUsuario(e) {
    e.preventDefault();

    const usuarioInput = document.getElementById('usuario');
    const rolInput = document.getElementById('rol');
    const contraseniaInput = document.getElementById('contrasenia');
    const laboratorioInput = document.getElementById('laboratorio-select');

    if (!usuarioInput || !rolInput || !contraseniaInput || !laboratorioInput) {
        console.error("Faltan elementos del formulario");
        return;
    }

    const usuario = usuarioInput.value.trim();
    const rol = rolInput.value;
    const contrasenia = contraseniaInput.value;
    const id_laboratorio = laboratorioInput.value;

    if (!usuario) {
        Swal.fire({
            title: 'Atención',
            text: 'Ingrese un usuario',
            icon: 'warning',
            confirmButtonColor: '#8b5a96',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!rol) {
        Swal.fire({
            title: 'Atención',
            text: 'Seleccione un rol',
            icon: 'warning',
            confirmButtonColor: '#8b5a96',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!contrasenia) {
        Swal.fire({
            title: 'Atención',
            text: 'Ingrese una contraseña',
            icon: 'warning',
            confirmButtonColor: '#8b5a96',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!id_laboratorio) {
        Swal.fire({
            title: 'Atención',
            text: 'Seleccione un laboratorio',
            icon: 'warning',
            confirmButtonColor: '#8b5a96',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const datos = {
        usuario: usuario,
        rol: rol,
        contrasenia: contrasenia,
        id_laboratorio: parseInt(id_laboratorio)
    };

    console.log("Datos enviados:", datos);

    try {
        const response = await fetch('http://127.0.0.1:5000/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: resultado.mensaje || "Usuario registrado",
                icon: 'success',
                confirmButtonColor: '#8b5a96',
                confirmButtonText: 'Entendido'
            });

            document.getElementById('form-usuario').reset();
        } else {
            Swal.fire({
                title: 'Error',
                text: resultado.error || "Error al registrar usuario",
                icon: 'error',
                confirmButtonColor: '#8b5a96',
                confirmButtonText: 'Entendido'
            });
        }

    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al conectar con el servidor',
            icon: 'error',
            confirmButtonColor: '#8b5a96',
            confirmButtonText: 'Entendido'
        });
    }
}