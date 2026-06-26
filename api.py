import os
import datetime
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask import Flask, jsonify, request
import pyodbc
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Función central para conectar a la base de datos
def get_db_connection():
    #conexion = pyodbc.connect(
        #'DRIVER={ODBC Driver 17 for SQL Server};'
        #'SERVER=192.168.100.78;'  # Tu dominio DNS configurado
        #'DATABASE=stockerlab;'         # El nombre de la base de datos que creaste
        #'UID=Super_Stocker;'      # El usuario que debes crear en SQL Server (PROHIBIDO usar 'sa')
        #'PWD=Windows2016'      # La contraseña de ese usuario
    #)
   #conexion maria
    conexion = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        #'SERVER=DESKTOP-RO62CP8\\MARILUBERSK;'
        'SERVER=localhost\\SQLEXPRESS;'
        #'SERVER=db.stockerlab.local;'
        'DATABASE=stockerlab;'
        'UID=Super_Stocker;'
        'PWD=Windows2016;'  
        'TrustServerCertificate=yes;' )
    #conexion melissa
    
    return conexion

# --------------------------------------------------------
# PING AL SERVIDOR
# --------------------------------------------------------
@app.route('/api/ping', methods=['GET'])
def ping_servidor():
    try:
        # Intentamos abrir la conexión y hacer una consulta vacía
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        conn.close()
        
        # Si funciona, le decimos al frontend (JS) que prenda el semáforo en verde
        return jsonify({
            "status": "online", 
            "mensaje": "Conexión exitosa"
        }), 200
        
    except Exception as e:
        # Si falla , le decimos que marque error
        return jsonify({
            "status": "offline", 
            "error": str(e)
        }), 500
    



#SECCION PARA EL REGISTRO DE USUARIOS
# SECCION PARA EL REGISTRO DE USUARIOS
@app.route('/api/usuarios', methods=['POST'])
def registrar_usuario():
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        data = request.get_json()

        usuario = data.get('usuario')
        rol = data.get('rol')
        contrasenia = data.get('contrasenia')
        id_laboratorio = data.get('id_laboratorio')

        if not usuario or not rol or not contrasenia or not id_laboratorio:
            return jsonify({
                "error": "Todos los campos son obligatorios"
            }), 400
        
        query_check = """
            SELECT IdUsuario 
            FROM dbo.usuario 
            WHERE Usuario = ?
        """
        cursor.execute(query_check, (usuario,))
        existe = cursor.fetchone()

        if existe:
            return jsonify({
                "error": "El usuario ya existe"
            }), 409

        # INSERT (tabla correcta)
        query_insert = """
            INSERT INTO dbo.usuario (Usuario, Rol, Contrasenia, IdLaboratorio)
            VALUES (?, ?, ?, ?)
        """

        cursor.execute(query_insert, (
            usuario,
            rol,
            contrasenia,
            id_laboratorio
        ))

        conn.commit()

        return jsonify({
            "mensaje": "Usuario registrado con éxito"
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()

        return jsonify({
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/laboratorios', methods=['GET'])
def obtener_laboratorios():
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                IdLaboratorio,
                Edificio,
                Salon,
                Categoria
            FROM laboratorio
            ORDER BY Categoria
        """

        cursor.execute(query)
        filas = cursor.fetchall()

        laboratorios = []

        for fila in filas:
            laboratorios.append({
                "id": fila[0],
                "edificio": fila[1],
                "salon": fila[2],
                "categoria": fila[3]
            })

        return jsonify(laboratorios), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
#OBTENER EL ULTIMO ID DE LA TABLA MATERIALES
@app.route('/api/materiales/ultimo_id', methods=['GET'])
def obtener_ultimo_id():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Consulta para obtener el último ID de la tabla 'material'
        query = "SELECT TOP 1 IdMaterial FROM material ORDER BY IdMaterial DESC"
        cursor.execute(query)
        resultado = cursor.fetchone()
        ultimo_id = resultado[0] if resultado else None
        
        cursor.close()
        conn.close()
        return jsonify(ultimo_id), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#OBTENER MATERIALES POR ID DE LABORATORIO
@app.route('/api/materiales/laboratorio/<int:id_lab>', methods=['GET'])
def obtener_materiales_por_laboratorio(id_lab):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # CORREGIDO: Consulta directa a la tabla 'material' usando los nombres exactos de tu BD
        query = """
            SELECT IdMaterial, Nombre_Material, Cantidad, IdLaboratorio, Ruta_Imagen 
            FROM material 
            WHERE IdLaboratorio = ?
        """
        cursor.execute(query, (id_lab,))
        filas = cursor.fetchall()

        materiales = []
        for fila in filas:
            materiales.append({
                "IdMaterial": fila[0],
                "Nombre_Material": fila[1],
                "Cantidad": fila[2],
                "IdLaboratorio": fila[3],
                "Ruta_Imagen": fila[4]  # Tomado directamente de tu columna en la tabla
            })
        
        cursor.close()
        conn.close()
        return jsonify(materiales), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
#OBTENER MATERIALES POR ID DE LABORATORIO y ID MATERIAL
@app.route('/api/materiales/laboratorio/<int:id_lab>/<int:id_Material>', methods=['GET'])
def obtener_materiales_por_laboratorio_id(id_lab, id_Material):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # CORREGIDO: Consulta directa a la tabla 'material' usando los nombres exactos de tu BD
        query = """
            SELECT IdMaterial, Nombre_Material, Cantidad, IdLaboratorio, Ruta_Imagen 
            FROM material 
            WHERE IdLaboratorio = ? AND IdMaterial = ?
        """
        cursor.execute(query, (id_lab,id_Material))
        filas = cursor.fetchall()

        materiales = []
        for fila in filas:
            materiales.append({
                "IdMaterial": fila[0],
                "Nombre_Material": fila[1],
                "Cantidad": fila[2],
                "IdLaboratorio": fila[3],
                "Ruta_Imagen": fila[4]  
            })
        
        cursor.close()
        conn.close()
        return jsonify(materiales), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
#OBTENER MATERIALES POR NOMBRE
@app.route('/api/materiales/laboratorio/<int:id_lab>/nombre/<string:nombre>', methods=['GET'])
def obtener_materiales_por_nombre_laboratorio(id_lab, nombre):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT IdMaterial, Nombre_Material, Cantidad, IdLaboratorio, Ruta_Imagen
            FROM material
            WHERE IdLaboratorio = ?
            AND Nombre_Material LIKE ?
        """

        cursor.execute(query, (id_lab, f"%{nombre}%"))
        filas = cursor.fetchall()

        materiales = []
        for fila in filas:
            materiales.append({
                "IdMaterial": fila[0],
                "Nombre_Material": fila[1],
                "Cantidad": fila[2],
                "IdLaboratorio": fila[3],
                "Ruta_Imagen": fila[4]
            })

        cursor.close()
        conn.close()

        return jsonify(materiales), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    


#OBTENER MATERIALES POR CANTIDAD
@app.route('/api/materiales/laboratorio/<int:id_lab>/cantidad/<int:cantidad>', methods=['GET'])
def obtener_materiales_por_cantidad(id_lab, cantidad):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT IdMaterial, Nombre_Material, Cantidad, IdLaboratorio, Ruta_Imagen
            FROM material
            WHERE IdLaboratorio = ?
            AND Cantidad = ?
        """

        cursor.execute(query, (id_lab, cantidad))
        filas = cursor.fetchall()

        materiales = []
        for fila in filas:
            materiales.append({
                "IdMaterial": fila[0],
                "Nombre_Material": fila[1],
                "Cantidad": fila[2],
                "IdLaboratorio": fila[3],
                "Ruta_Imagen": fila[4]
            })

        cursor.close()
        conn.close()

        return jsonify(materiales), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

# AGREGAR UN NUEVO MATERIAL
CARPETA_UPLOADS = os.path.join('static', 'uploads')
app.config['UPLOAD_FOLDER'] = CARPETA_UPLOADS

# Asegurarse de que la carpeta exista en el servidor, si no, crearla
if not os.path.exists(CARPETA_UPLOADS):
    os.makedirs(CARPETA_UPLOADS)

@app.route('/api/materiales', methods=['POST'])
def agregar_material():
    try:
        nombre = request.form.get('nombre')
        id_lab = request.form.get('id_lab')
        
        cantidad_raw = request.form.get('cantidad')
        cantidad = int(cantidad_raw) if cantidad_raw is not None and cantidad_raw.isdigit() else None
        
        url_texto = request.form.get('url_texto', default=None)

        data_validacion = {
            "nombre": nombre,
            "cantidad": cantidad_raw,
            "id_lab": id_lab
        }
        
        campos_obligatorios = ["nombre", "cantidad", "id_lab"]
        for campo in campos_obligatorios:
            if campo not in data_validacion or data_validacion[campo] is None or str(data_validacion[campo]).strip() == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio y no puede ser nulo"}), 400

        # Validar que la cantidad sea un entero válido y positivo
        if cantidad is None or cantidad < 0:
            return jsonify({"error": "La cantidad debe ser un número entero positivo"}), 400
        
        ruta_imagen_db = None

        if 'imagen' in request.files:
            file = request.files['imagen']
            if file.filename != '':
                # Extraemos la extensión original 
                extension = os.path.splitext(secure_filename(file.filename))[1].lower()
                
                nombre_archivo_seguro = secure_filename(nombre.strip().lower().replace(" ", "_"))
                
            
                nombre_final_imagen = f"{nombre_archivo_seguro}{extension}"
               
                ruta_guardado = os.path.join(app.config['UPLOAD_FOLDER'], nombre_final_imagen)
                
        
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                file.save(ruta_guardado)
                
                # Ruta relativa estándar que se almacenará textualmente en la base de datos
                ruta_imagen_db = f"static/uploads/{nombre_final_imagen}"
                
        elif url_texto and url_texto.strip() != "":
            # Si no subió archivo pero sí una URL manual
            ruta_imagen_db = url_texto.strip()

    
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO material (Nombre_Material, Cantidad, IdLaboratorio, Ruta_Imagen)
            OUTPUT INSERTED.IdMaterial
            VALUES (?, ?, ?, ?)
        """
        
        cursor.execute(query, (nombre, cantidad, int(id_lab), ruta_imagen_db))
        
        # Capturamos el ID 
        nuevo_id = cursor.fetchone()[0] 
        conn.commit()
        cursor.close() 
        conn.close()

        return jsonify({
            "mensaje": "Material registrado con éxito",
            "id": nuevo_id,
            "ruta_imagen": ruta_imagen_db
        }), 201
    except Exception as e:

        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

   

# ACTUALIZAR UN MATERIAL EXISTENTE
@app.route('/api/materiales/<int:id>', methods=['PUT'])
def actualizar_material(id):
    # Declaramos las variables al inicio para asegurar que el bloque 'except' pueda limpiarlas si algo falla antes de tiempo
    conn = None
    cursor = None
    try:
        nombre = request.form.get('nombre')
        id_lab = request.form.get('id_lab')
        
        cantidad_raw = request.form.get('cantidad')
        cantidad = int(cantidad_raw) if cantidad_raw is not None and cantidad_raw.isdigit() else None
        
        url_texto = request.form.get('url_texto', default=None)

        data_validacion = {
            "nombre": nombre,
            "cantidad": cantidad_raw,
            "id_lab": id_lab
        }
        
        campos_obligatorios = ["nombre", "cantidad", "id_lab"]
        for campo in campos_obligatorios:
            if campo not in data_validacion or data_validacion[campo] is None or str(data_validacion[campo]).strip() == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio y no puede ser nulo"}), 400

        if cantidad is None or cantidad < 0:
            return jsonify({"error": "La cantidad debe ser un número entero positivo"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT Ruta_Imagen FROM material WHERE IdMaterial = ?", (id,))
        fila_actual = cursor.fetchone()

        if not fila_actual:
            cursor.close()
            conn.close()
            return jsonify({"error": "El material que intentas actualizar no existe"}), 404

        ruta_imagen_db = fila_actual[0] 

        if 'imagen' in request.files:
            file = request.files['imagen']
            if file.filename != '':
                extension = os.path.splitext(secure_filename(file.filename))[1].lower()
                

                nombre_archivo_seguro = secure_filename(nombre.strip().lower().replace(" ", "_"))
                nombre_final_imagen = f"{nombre_archivo_seguro}{extension}"
                
                ruta_guardado = os.path.join(app.config['UPLOAD_FOLDER'], nombre_final_imagen)
                
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                file.save(ruta_guardado)
                
                ruta_imagen_db = f"static/uploads/{nombre_final_imagen}"
                
        elif url_texto and url_texto.strip() != "" and not url_texto.startswith('[Archivo Local]'):
            ruta_imagen_db = url_texto.strip()

        query = """
            UPDATE material 
            SET Nombre_Material = ?, 
                Cantidad = ?, 
                IdLaboratorio = ?, 
                Ruta_Imagen = ?
            WHERE IdMaterial = ?
        """
        
        cursor.execute(query, (nombre, cantidad, int(id_lab), ruta_imagen_db, id))
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({
            "mensaje": "Material actualizado con éxito",
            "id": id,
            "ruta_imagen": ruta_imagen_db
        }), 200


    except Exception as e:
        try:
            conn.rollback()
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

#Eliminar un material
@app.route('/api/materiales/<int:id>', methods=['DELETE'])
def eliminar_material(id):
    conn = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*)
            FROM bitacora_material
            WHERE IdMaterial = ?
        """, (id,))
        
        referencias = cursor.fetchone()[0]

        if referencias > 0:
            return jsonify({
                "mensaje": "Este material no puede eliminarse porque tiene registros en bitácora"
            }), 409

        cursor.execute(
            "DELETE FROM material WHERE IdMaterial = ?",
            (id,)
        )

        conn.commit()
        return jsonify({"mensaje": "Material eliminado"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    
#OBTENER LABORATORIO POR ID
@app.route('/api/laboratorios/<int:id>', methods=['GET'])
def obtener_laboratorio_por_id(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos el laboratorio específico por su ID único
        query = "SELECT IdLaboratorio,Edificio,Salon, Categoria FROM laboratorio WHERE IdLaboratorio = ?"
        cursor.execute(query, (id,))
        fila = cursor.fetchone()

        if not fila:
            return jsonify({"mensaje" : "No se encontro el laboratorio"}),400
        
        laboratorio = {
            "id": fila[0],
            "edificio": fila[1],
            "salon": fila[2],
            "categoria": fila[3]
        }
        
        conn.close()
        return jsonify(laboratorio), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
#OBTENER BITACORA MATERIALES FILTRADO POR ID DEL LABORATORIO
@app.route('/api/bitacora/laboratorio/<int:id_lab>', methods=['GET'])
def obtener_bitacora_por_laboratorio(id_lab):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                b.Id_bit_mat,
                b.IdMaterial,
                m.Nombre_Material,
                b.Tipo,
                b.Cantidad,
                b.Descripcion,
                b.Fecha,
                b.Exp_Maestro
            FROM bitacora_material b
            JOIN material m ON b.IdMaterial = m.IdMaterial
            WHERE b.IdLaboratorio = ?
            ORDER BY b.Fecha DESC
        """

        cursor.execute(query, (id_lab,))
        filas = cursor.fetchall()

        bitacora = []

        for fila in filas:
            bitacora.append({
                "id_bitacora": fila[0],
                "id_material": fila[1],
                "nombre_material": fila[2],

                # Si BD guarda texto:
                "tipo": fila[3],

                # Si guarda 1/0 usa esto en lugar de arriba:
                # "tipo": "Entrada" if fila[3] == 1 else "Salida",

                "cantidad": fila[4],
                "descripcion": fila[5],
                "fecha": fila[6].isoformat() if fila[6] else None,
                "exp_maestro": fila[7]
            })

        cursor.close()
        conn.close()

        return jsonify(bitacora), 200

    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()

        return jsonify({"error": str(e)}), 500
    
#OBTENER BITACORA DE MATERIALES POR ID DE MATERIALES
@app.route('/api/bitacora/laboratorio/<int:id_lab>/<int:id_mat>', methods=['GET'])
def obtener_bitacora_materiales_por_materiales(id_lab, id_mat):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                b.Id_bit_mat,
                b.IdMaterial,
                m.Nombre_Material,
                b.Tipo,
                b.Cantidad,
                b.Descripcion,
                b.Fecha,
                b.Exp_Maestro
            FROM bitacora_material b
            JOIN material m ON b.IdMaterial = m.IdMaterial
            WHERE b.IdLaboratorio = ? AND b.Id_bit_mat = ?
            ORDER BY b.Fecha DESC
        """

        cursor.execute(query, (id_lab, id_mat))
        filas = cursor.fetchall()

        bitacora = []

        for fila in filas:
            bitacora.append({
                "id_bitacora": fila[0],
                "id_material": fila[1],
                "nombre_material": fila[2],

                # CORREGIDO
                "tipo": fila[3],

                "cantidad": fila[4],
                "descripcion": fila[5],
                "fecha": fila[6].isoformat() if fila[6] else None,
                "exp_maestro": fila[7]
            })

        cursor.close()
        conn.close()

        return jsonify(bitacora), 200

    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()

        return jsonify({"error": str(e)}), 500
    
#OBTENER BITACORA DE MATERIALES POR ID DE PROFESOR
@app.route('/api/bitacora/laboratorio/<int:id_lab>/maestro/<int:exp_maestro>', methods=['GET'])
def obtener_bitacora_por_maestro(id_lab, exp_maestro):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                b.Id_bit_mat,
                b.IdMaterial,
                m.Nombre_Material,
                b.Tipo,
                b.Cantidad,
                b.Descripcion,
                b.Fecha,
                b.Exp_Maestro
            FROM bitacora_material b
            JOIN material m ON b.IdMaterial = m.IdMaterial
            WHERE b.IdLaboratorio = ? AND b.Exp_Maestro = ?
            ORDER BY b.Fecha DESC
        """

        cursor.execute(query, (id_lab, exp_maestro))
        filas = cursor.fetchall()

        bitacora = []

        for fila in filas:
            bitacora.append({
                "id_bitacora": fila[0],
                "id_material": fila[1],
                "nombre_material": fila[2],

                # CORREGIDO
                "tipo": fila[3],

                "cantidad": fila[4],
                "descripcion": fila[5],
                "fecha": fila[6].isoformat() if fila[6] else None,
                "exp_maestro": fila[7]
            })

        cursor.close()
        conn.close()

        return jsonify(bitacora), 200

    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()

        return jsonify({"error": str(e)}), 500
    
#OBTENER BITACORA DE INCIDENCIA POR ID DE INCIDENCIA

#OBTENER BITACORA DE INCIDENCIA POR ID DE PROFESOR


#AGREGAR NUEVO MOVIMIENTO A LA BITACORA DE MATERIALES
@app.route("/bitacora/materiales", methods=["POST"])
def insertarBitacoraMaterial():
    try:
        data = request.json  # Obtenemos los datos insertados por el usuario desde JS
        
        # 1. Definir campos requeridos (usando las llaves exactas que envías desde JavaScript)
        campos_obligatorios = ["IdMaterial", "Cantidad", "Descripcion", "Exp_Maestro", "Tipo" , "IdLaboratorio"]
        for campo in campos_obligatorios:
            if campo not in data or data[campo] is None or str(data[campo]).strip() == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400

        if data["Cantidad"] <= 0:
            return jsonify({"error": "La cantidad debe ser un número entero positivo mayor a cero"}), 400

        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # La columna 'Fecha' se llena automáticamente con el tiempo actual del servidor mediante datetime.datetime.now()
        fecha_actual = datetime.datetime.now()

        query = """
            INSERT INTO bitacora_material 
            (Fecha, Descripcion, Tipo, Cantidad, Exp_Maestro, IdLaboratorio, IdMaterial) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        
        cursor.execute(query,(fecha_actual, data["Descripcion"] , data["Tipo"], data["Cantidad"], data["Exp_Maestro"], data["IdLaboratorio"], data["IdMaterial"]))
        conn.commit()
        
        conn.close()
        return jsonify({"mensaje": "Bitácora de material registrada exitosamente"}), 201
    
    except Exception as e:
        if conn is not None:
                try:
                    conn.rollback()
                    conn.close()
                except Exception:
                    pass
        return jsonify({"error": str(e)}), 500

#ACTUALIZAR BITACORA DE MATERIALES
@app.route("/bitacora/atualizar/materiales/<int:id_bit_mat>", methods=["PUT"])
def actualizarBitacoraMaterial(id_bit_mat):
    try:
        data = request.json  # Obtenemos los datos insertados por el usuario desde JS
        
        # 1. Definir campos requeridos (usando las llaves exactas que envías desde JavaScript)
        campos_obligatorios = ["IdMaterial", "Cantidad", "Descripcion", "Exp_Maestro", "Tipo" , "IdLaboratorio"]
        for campo in campos_obligatorios:
            if campo not in data or data[campo] is None or str(data[campo]).strip() == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400

        if data["Cantidad"] <= 0:
            return jsonify({"error": "La cantidad debe ser un número entero positivo mayor a cero"}), 400

        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # La columna 'Fecha' se llena automáticamente con el tiempo actual del servidor mediante datetime.datetime.now()
        fecha_actual = datetime.datetime.now()

        cursor.execute("""
            UPDATE bitacora_material  
            SET Fecha = ? , Descripcion = ?, Tipo =?, Cantidad = ?, Exp_Maestro =?, IdLaboratorio =?, IdMaterial=?
            WHERE Id_bit_mat = ?
        """, (fecha_actual, data["Descripcion"] , data["Tipo"], data["Cantidad"], data["Exp_Maestro"], data["IdLaboratorio"],data["IdMaterial"], id_bit_mat))

        conn.commit()
        
        conn.close()
        return jsonify({"mensaje": "Bitácora de material actualizada exitosamente"}), 201
    
    except Exception as e:
        if conn is not None:
                try:
                    conn.rollback()
                    conn.close()
                except Exception:
                    pass
        return jsonify({"error": str(e)}), 500

#ELIMINAR UN REGISTRO DE LA BITACORA DE MATERIALES
@app.route('/api/bitacoras/materiales/eliminar/<int:id>', methods=['DELETE'])
def eliminar_Bitacora(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificamos si la incidencia existe
        query = "SELECT Id_bit_mat FROM bitacora_material WHERE Id_bit_mat = ?"
        cursor.execute(query, (id,))
        fila = cursor.fetchone()

        if not fila:
            return jsonify({"mensaje": "No se encontro la incidencia"}), 404

        # Eliminamos la incidencia
        query = "DELETE FROM bitacora_material WHERE Id_bit_mat = ?"
        cursor.execute(query, (id,))
        conn.commit()

        conn.close()
        return jsonify({"mensaje": "Bitacora eliminada con éxito"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
        
#OBTENER BITACORA DE INCIDENCIAS FILTRADO POR ID DEL LABORATORIO
@app.route('/api/bitacora/incidencias/laboratorio/<int:id_lab>', methods=['GET'])
def obtener_bitacora_incidencias_por_laboratorio(id_lab):   
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos los registros de la bitácora específicos por su ID de laboratorio
        query = """
            SELECT 
        b.Id_bit_inc, 
        b.IdMaterial, 
        m.Nombre_Material, 
        b.Tipo,
        b.Cantidad, 
        b.Descripcion,
        b.Fecha,
        b.Exp_Maestro,
        b.Exp_Alumno
      FROM bitacora_incidencia b
      JOIN material m ON b.IdMaterial = m.IdMaterial
       WHERE b.IdLaboratorio = ?
       ORDER BY b.Fecha DESC
        """
        cursor.execute(query, (id_lab,))
        filas = cursor.fetchall()

        bitacora = []
        for fila in filas:
         bitacora.append({
         "id_bitacora": fila[0],
         "id_material": fila[1],
         "nombre_material": fila[2],
         "tipo": "Entrada" if fila[3] else "Salida",
         "cantidad": fila[4],
         "descripcion": fila[5],
         "fecha": fila[6].isoformat() if fila[6] else None,  # Convertimos a formato ISO para JSON
         "exp_maestro": fila[7],  
         "exp_alumno": fila[8]  
       })
        
        conn.close()
        return jsonify(bitacora), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    

#OBTENER BITACORA DE INCIDENCIA POR ID DE INCIDENCIA
@app.route('/api/bitacora/incidencias/laboratorio/<int:id_lab>/<int:id_inc>', methods=['GET'])
def obtener_bitacora_incidencias_por_incidencia(id_lab, id_inc):   
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos los registros de la bitácora específicos por su ID de laboratorio
        query = """
            SELECT 
        b.Id_bit_inc, 
        b.IdMaterial, 
        m.Nombre_Material, 
        b.Tipo,
        b.Cantidad, 
        b.Descripcion,
        b.Fecha,
        b.Exp_Maestro,
        b.Exp_Alumno
      FROM bitacora_incidencia b
      JOIN material m ON b.IdMaterial = m.IdMaterial
       WHERE b.IdLaboratorio = ? AND b.Id_bit_inc = ?
       ORDER BY b.Fecha DESC
        """
        cursor.execute(query, (id_lab, id_inc))
        filas = cursor.fetchall()

        bitacora = []
        for fila in filas:
         bitacora.append({
         "id_bitacora": fila[0],
         "id_material": fila[1],
         "nombre_material": fila[2],
         "tipo": "Entrada" if fila[3] else "Salida",
         "cantidad": fila[4],
         "descripcion": fila[5],
         "fecha": fila[6].isoformat() if fila[6] else None,  # Convertimos a formato ISO para JSON
         "exp_maestro": fila[7],  
         "exp_alumno": fila[8]  
       })
        
        conn.close()
        return jsonify(bitacora), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
#OBTENER BITACORA DE INCIDENCIA POR ID DE PROFESOR
@app.route('/api/bitacora/incidencias/laboratorio/<int:id_lab>/maestro/<int:exp_maestro>', methods=['GET'])
def obtener_incidencias_por_maestro(id_lab, exp_maestro):   
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                b.Id_bit_inc, b.IdMaterial, m.Nombre_Material, b.Tipo,
                b.Cantidad, b.Descripcion, b.Fecha, b.Exp_Maestro, b.Exp_Alumno
            FROM bitacora_incidencia b
            JOIN material m ON b.IdMaterial = m.IdMaterial
            WHERE b.IdLaboratorio = ? AND b.Exp_Maestro = ?
            ORDER BY b.Fecha DESC
        """
        # Pasamos ambos parámetros a la consulta
        cursor.execute(query, (id_lab, exp_maestro))
        filas = cursor.fetchall()

        bitacora = []
        for fila in filas:
            bitacora.append({
                "id_bitacora": fila[0],
                "id_material": fila[1],
                "nombre_material": fila[2],
                "tipo": "Entrada" if fila[3] else "Salida",
                "cantidad": fila[4],
                "descripcion": fila[5],
                "fecha": fila[6].isoformat() if fila[6] else None,
                "exp_maestro": fila[7],
                "exp_alumno": fila[8]
            })
        
        conn.close()
        return jsonify(bitacora), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
#OBTENER BITACORA DE INCIDENCIA POR ID DE ALUMNO
@app.route('/api/bitacora/incidencias/laboratorio/<int:id_lab>/alumno/<int:exp_alumno>', methods=['GET'])
def obtener_incidencias_por_alumno(id_lab, exp_alumno):   
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                b.Id_bit_inc, b.IdMaterial, m.Nombre_Material, b.Tipo,
                b.Cantidad, b.Descripcion, b.Fecha, b.Exp_Maestro, b.Exp_Alumno
            FROM bitacora_incidencia b
            JOIN material m ON b.IdMaterial = m.IdMaterial
            WHERE b.IdLaboratorio = ? AND b.Exp_Alumno = ?
            ORDER BY b.Fecha DESC
        """
        # Pasamos ambos parámetros a la consulta
        cursor.execute(query, (id_lab, exp_alumno))
        filas = cursor.fetchall()

        bitacora = []
        for fila in filas:
            bitacora.append({
                "id_bitacora": fila[0],
                "id_material": fila[1],
                "nombre_material": fila[2],
                "tipo": "Entrada" if fila[3] else "Salida",
                "cantidad": fila[4],
                "descripcion": fila[5],
                "fecha": fila[6].isoformat() if fila[6] else None,
                "exp_maestro": fila[7],
                "exp_alumno": fila[8]
            })
        
        conn.close()
        return jsonify(bitacora), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
#AGREGAR NUEVA INCIDENCIA A LA BITACORA DE INCIDENCIAS
@app.route('/api/bitacora/incidencias/laboratorio/<int:id_lab>', methods=['POST'])
def crear_incidencia_laboratorio(id_lab):
    try:
        # Obtenemos los datos enviados desde el frontend en formato JSON
        datos = request.json
        
        if not datos:
            return jsonify({"error": "No se recibieron datos en la petición"}), 400

        # Extraemos las variables
        id_material = datos.get('id_material')
        tipo_texto = datos.get('tipo')
        cantidad = datos.get('cantidad')
        descripcion = datos.get('descripcion')
        exp_maestro = datos.get('exp_maestro')
        exp_alumno = datos.get('exp_alumno')

        
        # -----------------VALIDACIONES: TODOS LOS CAMPOS LLENOS------------------------
        # Comprobamos que ninguna variable sea None o un string vacío ('')
        if not all([id_material, tipo_texto, cantidad, descripcion, exp_maestro, exp_alumno]):
            return jsonify({"error": "Todos los campos son obligatorios"}), 400

       
         # -----------------VALIDACIONES: CANTIDAD MAYOR A 0 ------------------------
       
        try:
            cantidad = int(cantidad)
            if cantidad <= 0:
                return jsonify({"error": "La cantidad debe ser un número mayor a 0"}), 400
        except ValueError:
            return jsonify({"error": "La cantidad enviada no es un formato numérico válido"}), 400

      
        # -----------------VALIDACIONES: EXPEDIENTES DE EXACTAMENTE 9 DÍGITOS
        # Los convertimos a texto quitando espacios en blanco a los lados por si el usuario puso un espacio sin querer
        exp_maestro_str = str(exp_maestro).strip()
        exp_alumno_str = str(exp_alumno).strip()

        # isdigit() asegura que sean solo números y len() cuenta que sean exactamente 9
        if not (exp_maestro_str.isdigit() and len(exp_maestro_str) == 9):
            return jsonify({"error": "El expediente del maestro debe tener exactamente 9 dígitos numéricos"}), 400
            
        if not (exp_alumno_str.isdigit() and len(exp_alumno_str) == 9):
            return jsonify({"error": "El expediente del alumno debe tener exactamente 9 dígitos numéricos"}), 400

  
        # Transformamos el texto "Entrada" a 1 (True) y "Salida" a 0 (False) para SQL Server
        tipo_bit = 1 if tipo_texto.lower() == 'entrada' else 0
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Usamos OUTPUT INSERTED para recuperar el ID generado automáticamente por SQL Server al insertar el nuevo registro
        # Usamos GETDATE() de SQL Server para guardar la fecha y hora exacta del registro
        query = """
            SET NOCOUNT ON;
            
            INSERT INTO bitacora_incidencia 
            (IdMaterial, IdLaboratorio, Tipo, Cantidad, Descripcion, Fecha, Exp_Maestro, Exp_Alumno)
            VALUES (?, ?, ?, ?, ?, GETDATE(), ?, ?);
            
            SELECT SCOPE_IDENTITY();
        """
        
        cursor.execute(query, (id_material, id_lab, tipo_bit, cantidad, descripcion, exp_maestro_str, exp_alumno_str))
        
        # Recuperamos el ID recién creado
        nuevo_id = int(cursor.fetchone()[0])
        
        # Confirmamos los cambios en la BD
        conn.commit()
        conn.close()

        # Devolvemos un 201 (Created) y el ID generado
        return jsonify({
            "mensaje": "Incidencia registrada con éxito", 
            "id_bit_inc": nuevo_id
        }), 201

    except Exception as e:
        # En caso de error de base de datos, revertimos cualquier cambio incompleto
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return jsonify({"error": str(e)}), 500

#ACTUALIZAR BITACORA DE INCIDENCIA
@app.route('/api/bitacora/incidencias/laboratorio/<int:id_lab>/<int:id_inc>', methods=['PUT'])
def actualizar_incidencia_laboratorio(id_lab, id_inc):
    try:
        # Obtenemos los datos enviados desde el frontend en formato JSON
        datos = request.json
        
        if not datos:
            return jsonify({"error": "No se recibieron datos en la petición"}), 400

        # Extraemos las variables con los nuevos valores
        id_material = datos.get('id_material')
        tipo_texto = datos.get('tipo')
        cantidad = datos.get('cantidad')
        descripcion = datos.get('descripcion')
        exp_maestro = datos.get('exp_maestro')
        exp_alumno = datos.get('exp_alumno')

         # -----------------VALIDACIONES: TODOS LOS CAMPOS LLENOS------------------------
        # Comprobamos que ninguna variable sea None o un string vacío ('')
        if not all([id_material, tipo_texto, cantidad, descripcion, exp_maestro, exp_alumno]):
            return jsonify({"error": "Todos los campos son obligatorios para actualizar"}), 400

         # -----------------VALIDACIONES: CANTIDAD MAYOR A 0 ------------------------
        try:
            cantidad = int(cantidad)
            if cantidad <= 0:
                return jsonify({"error": "La cantidad debe ser un número mayor a 0"}), 400
        except ValueError:
            return jsonify({"error": "La cantidad enviada no es un formato numérico válido"}), 400

        # -----------------VALIDACIONES: EXPEDIENTES DE EXACTAMENTE 9 DÍGITOS
        # Los convertimos a texto quitando espacios en blanco a los lados por si el usuario puso un espacio sin querer
        exp_maestro_str = str(exp_maestro).strip()
        exp_alumno_str = str(exp_alumno).strip()

        if not (exp_maestro_str.isdigit() and len(exp_maestro_str) == 9):
            return jsonify({"error": "El expediente del maestro debe tener exactamente 9 dígitos numéricos"}), 400
            
        if not (exp_alumno_str.isdigit() and len(exp_alumno_str) == 9):
            return jsonify({"error": "El expediente del alumno debe tener exactamente 9 dígitos numéricos"}), 400

    
        tipo_bit = 1 if tipo_texto.lower() == 'entrada' else 0

    
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            UPDATE bitacora_incidencia
            SET IdMaterial = ?, 
                Tipo = ?, 
                Cantidad = ?, 
                Descripcion = ?, 
                Exp_Maestro = ?, 
                Exp_Alumno = ?
            WHERE IdLaboratorio = ? AND Id_bit_inc = ?
        """
        
        cursor.execute(query, (id_material, tipo_bit, cantidad, descripcion, exp_maestro_str, exp_alumno_str, id_lab, id_inc))
        
        # cursor.rowcount nos dice cuántas filas se modificaron. 
        # Si es 0, significa que esa incidencia no existe o no pertenece a ese laboratorio.
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "No se encontró la incidencia especificada para este laboratorio"}), 404

        # Confirmamos la transacción en la BD
        conn.commit()
        conn.close()

        return jsonify({"mensaje": "Incidencia actualizada con éxito"}), 200

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/api/bitacora/incidencias/<int:id>', methods=['DELETE'])
def eliminar_incidencia(id):
    conn = None  # 1. Inicializamos conn en None para evitar el NameError
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificamos si la incidencia existe
        query = "SELECT Id_bit_inc FROM bitacora_incidencia WHERE Id_bit_inc = ?"
        cursor.execute(query, (id,))
        fila = cursor.fetchone()

        if not fila:
            conn.close()
            return jsonify({"mensaje": "No se encontro la incidencia"}), 404

       
        query = "DELETE FROM bitacora_incidencia WHERE Id_bit_inc = ?"
        cursor.execute(query, (id,))
        conn.commit()

        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Incidencia eliminada con éxito"}), 200

    except Exception as e:
        # Imprime el error exacto en tu terminal/consola de Python para saber qué falló en SQL
        print(f"🔴 Error interno en el servidor: {str(e)}") 
        
        # Solo hacemos rollback y close si la conexión se logró abrir exitosamente
        if conn is not None:
            try:
                conn.rollback()
                conn.close()
            except Exception as db_err:
                print(f"No se pudo cerrar la conexion: {str(db_err)}")
                
        return jsonify({"error": str(e)}), 500
    
#usuario
@app.route('/api/usser/laboratorios/<string:nombre>', methods=['GET'])
def obtener_laboratorio_por_idUsuario(nombre):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos el laboratorio específico por su ID único
        query = "SELECT IdUsuario,Usuario, Contrasenia , IdLaboratorio FROM usuario WHERE Usuario = ?"
        cursor.execute(query, (nombre,))
        fila = cursor.fetchone()

        if not fila:
            return jsonify({"mensaje" : "No se encontro el laboratorio"}),400
        
        usuario = {
            "id": fila[0],
            "Usuario": fila[1],
            "Contrasenia": fila[2],
            "IdLaboratorio": fila[3]
        }
        
        conn.close()
        return jsonify(usuario), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
    
if __name__ == '__main__':
    # Esto levanta el servidor en el puerto 5000
    app.run(debug=True, port=5000)

