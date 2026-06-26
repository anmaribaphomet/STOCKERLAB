async function validarContraseña() {
    const usser = document.getElementById('usuario');
    const password = document.getElementById('contraseña');

    const usuario = usser.value.trim();
    const contrasenia = password.value;

    if (!usuario || !contrasenia) {
        console.warn("El campo de usuario está vacío.");
        return null;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/usser/laboratorios/${usuario}`);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);//Si la respuesta es no satisfactoria arroja ese error 
        }

        const datosUsuario = await response.json();
        return datosUsuario;

    } catch (error) {
        console.error("Error al conectar con la API de StockerLab:", error);

    }


}

const btnEnviar = document.getElementById('enviar-datos');//Evento del boton de enviar
btnEnviar.addEventListener('click', async (e) => {//cuando hagas click

    const usuarioRecibido = await validarContraseña();

    if (usuarioRecibido) {
        const contraseniaIngresada = document.getElementById('contraseña').value;//El campo de input de la contrasenia

        // Comparamos la contraseña del input con el campo 'Contraseña' que viene en el JSON de Flask
        if (usuarioRecibido.Contrasenia === contraseniaIngresada) {
            alert(`¡Bienvenido al sistema, ${usuarioRecibido.Usuario}!`);
            console.log(usuarioRecibido.IdLaboratorio);
            sessionStorage.setItem('idLaboratorio', usuarioRecibido.IdLaboratorio);
            sessionStorage.setItem('nombreUsuario', usuarioRecibido.Usuario); // Opcional, por si quieres mostrar su nombre

            // Redirigimos a la ventana principal o panel de control
            window.location.href = 'bit_materiales/bitacora.html';
        } else {
            alert("La contraseña introducida es incorrecta.");
        }
    } else {
        alert("No se pudo iniciar sesión. Verifica el usuario o la conexión con el servidor.");
    }
});


