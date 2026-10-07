# Stocker_Lab
## Creadores
@anmaribaphomet
@MushCay 

## Descripción
Sistema de manejo y control de inventarios , con una bitácora de entrada y salida , así como también
una de incidencias para la gestión de perdidas o daños.Propuesta para centralizar la gestion de multiples laboratorios.Proyecto perteneciente
a la materia de Servidores II

## Interfaz Grafica

<img width="931" height="505" alt="image" src="https://github.com/user-attachments/assets/3e01d923-13fc-486f-a249-1972c17aab19" />

<img width="931" height="503" alt="image" src="https://github.com/user-attachments/assets/12767820-a98a-4a85-97f1-35aa8573fd1a" />

<img width="931" height="503" alt="image" src="https://github.com/user-attachments/assets/6703c538-7b17-49a4-aab8-f99db2ab944c" />

<img width="931" height="501" alt="image" src="https://github.com/user-attachments/assets/43f178eb-0b4f-4cb1-83f4-9ae4ece28c85" />

<img width="936" height="477" alt="image" src="https://github.com/user-attachments/assets/f4860a0b-f1dc-4808-94e5-2dbf69835912" />

##  Características

* **Backend API REST**: Desarrollado en Python (`api.py`) para gestionar la lógica de negocio.
* **Módulos Principales**:
  * **Autenticación**: Inicio de sesión (`iniciosesion`, `login.html`) y registro de usuarios (`registroUsuario`).
  * **Catálogo de Materiales**: Administración de materiales de laboratorio (`catalogomateriales`).
  * **Bitácora de Materiales**: Registro de entradas, salidas y uso de materiales(`bit_materiales`).
  * **Bitácora de Incidencias**: Reporte y seguimiento de incidencias o fallas en el laboratorio (`bit_incidencias`).
* **Archivos Multimedia**: Almacenamiento de recursos y archivos subidos en `static/uploads`.

## Estructura del Proyecto

```text
├── bit_incidencias/     # Módulo de gestión de incidencias
├── bit_materiales/      # Módulo de bitácora de uso de materiales
├── catalogomateriales/  # Módulo de catálogo de materiales
├── iniciosesion/        # Componentes de autenticación
├── registroUsuario/     # Formulario y control de registro de usuarios
├── static/uploads/      # Almacenamiento de archivos y multimedia
├── api.py               # Servidor principal API en Python
├── login.html           # Interfaz de inicio de sesión
├── login.css            # Estilos para el inicio de sesión
└── script (1).js        # Control de cliente e interacciones JS
