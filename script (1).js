async function validarContraseña() {
    const usser = document.getElementById('usuario');
    const password = document.getElementById('contraseña');

    const usuario = usser.value.trim();
    const contrasenia = password.value;

    if (!usuario || !contrasenia) {
        Swal.fire({
            title: 'Atención',
            text: 'Por favor, rellene todos los campos.',
            icon: 'warning',
            confirmButtonColor: '#8b5a96'
        });
        return null;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/usser/laboratorios/${usuario}`);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const datosUsuario = await response.json();
        return datosUsuario;

    } catch (error) {
        console.error("Error al conectar con la API de StockerLab:", error);
        return null;
    }
}

const btnEnviar = document.getElementById('enviar-datos');
btnEnviar.addEventListener('click', async (e) => {
    e.preventDefault(); // Evita recargas inesperadas de página

    const usuarioRecibido = await validarContraseña();

    if (usuarioRecibido) {
        const contraseniaIngresada = document.getElementById('contraseña').value;

        // Comparamos la contraseña (revisa las mayúsculas de tu endpoint 'Contrasenia')
        if (usuarioRecibido.Contrasenia === contraseniaIngresada) {

            // GUARDAMOS EN SESSIONSTORAGE
            sessionStorage.setItem('idLaboratorio', usuarioRecibido.IdLaboratorio);
            sessionStorage.setItem('nombreUsuario', usuarioRecibido.Usuario); // Guardando el nombre de tu JSON

            // Alerta estética de bienvenida antes de redirigir
            Swal.fire({
                title: '¡Bienvenido!',
                text: `Hola de nuevo, ${usuarioRecibido.Usuario}`,
                icon: 'success',
                confirmButtonColor: '#8b5a96',
                timer: 2000,
                showConfirmButton: false
            });

            // Redirección con retraso corto para que se alcance a ver el éxito
            setTimeout(() => {
                window.location.href = 'catalogomateriales/materiales.html';
            }, 1800);

        } else {
            Swal.fire({
                title: 'Error',
                text: 'La contraseña introducida es incorrecta.',
                icon: 'error',
                confirmButtonColor: '#8b5a96'
            });
        }
    } else {
        Swal.fire({
            title: 'Error de acceso',
            text: 'Verifica el usuario o la conexión con el servidor.',
            icon: 'error',
            confirmButtonColor: '#8b5a96'
        });
    }
});
