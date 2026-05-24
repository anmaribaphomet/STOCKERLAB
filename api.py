from flask import Flask, jsonify, request
import pyodbc
from flask_cors import CORS 
app = Flask(__name__)
CORS(app)

# Función central para conectar a la base de datos
def get_db_connection():
    #conexion = pyodbc.connect(
        #'DRIVER={ODBC Driver 17 for SQL Server};'
       #'SERVER=db.stockerlab.local;'  # Tu dominio DNS configurado
        #'DATABASE=stockerlab;'         # El nombre de la base de datos que creaste
       # 'UID=Super_Stocker;'      # El usuario que debes crear en SQL Server (PROHIBIDO usar 'sa')
       # 'PWD=Windows2016'      # La contraseña de ese usuario
   # )
   #conexion maria
     conexion = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=DESKTOP-RO62CP8\\MARILUBERSK;'
        'DATABASE=stockerlab;'
        'UID=Super_Stocker;'
        'PWD=Windows2016;'  
        'TrustServerCertificate=yes;'
            )
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

    
# OBTENER UN MATERIAL POR SU ID   
@app.route('/api/materiales/<int:id>', methods=['GET'])
def obtener_material_por_id(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos el material específico por su ID único
        query = "SELECT IdMaterial, Nombre_Material, Cantidad, Idlaboratorio FROM material WHERE IdMaterial = ?"
        cursor.execute(query, (id,))
        fila = cursor.fetchone()

        if not fila:
            return jsonify({"mensaje" : "No se encontro el material"}),400
        
        material = {
            "id": fila[0],
            "nombre": fila[1],
            "cantidad": fila[2],
            "id_laboratorio": fila[3]
        }
        
        conn.close()
        return jsonify(material), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

#OBTENER MATERIALES POR ID DE LABORATORIO
@app.route('/api/materiales/laboratorio/<int:id_lab>', methods=['GET'])
def obtener_materiales_por_laboratorio(id_lab):
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos los materiales específicos por su ID de laboratorio
        query = "SELECT IdMaterial, Nombre_Material, Cantidad, Idlaboratorio FROM material WHERE IdLaboratorio = ?"
        cursor.execute(query, (id_lab,))
        filas = cursor.fetchall()

        materiales = []
        for fila in filas:
            materiales.append({
                "id": fila[0],
                "nombre": fila[1],
                "cantidad": fila[2],
                "id_laboratorio": fila[3]
            })
        
        conn.close()
        return jsonify(materiales), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
#OBTENER MATERIALES POR NOMBRE
@app.route('/api/materiales/nombre/<string:nombre>', methods=['GET'])
def obtener_materiales_por_nombre(nombre):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos los materiales específicos por su nombre (usamos LIKE para búsqueda parcial)
        query = "SELECT IdMaterial, Nombre_Material, Cantidad, Idlaboratorio FROM material WHERE Nombre_Material LIKE ?"
        cursor.execute(query, ('%' + nombre + '%',))
        filas = cursor.fetchall()

        materiales = []
        for fila in filas:
            materiales.append({
                "id": fila[0],
                "nombre": fila[1],
                "cantidad": fila[2],
                "id_laboratorio": fila[3]
            })
        
        conn.close()
        return jsonify(materiales), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
    
# AGREGAR UN NUEVO MATERIAL
@app.route('/api/materiales', methods=['POST'])
def agregar_material():
    try:
        data = request.json 
        campos_obligatorios = ["nombre", "cantidad", "id_lab"]
        
        for campo in campos_obligatorios:
            if campo not in data or data[campo] is None or data[campo] == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio y no puede ser nulo"}), 400 #mensaje de error de que falto llenar un campo
        if not isinstance(data["cantidad"], int) or data["cantidad"] < 0:
            return jsonify({"error": "La cantidad debe ser un número entero positivo"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO material (Nombre_Material, Cantidad, IdLaboratorio)
            OUTPUT INSERTED.IdMaterial
            VALUES (?, ?, ?)
        """
        cursor.execute(query, (data["nombre"], data["cantidad"], data["id_lab"]))
        
       
        nuevo_id = cursor.fetchone()[0] 
        conn.commit()
        
        conn.close()

        return jsonify({
            "mensaje": "Material registrado con éxito",
            "id": nuevo_id
        }), 201

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

# ACTUALIZAR UN MATERIAL EXISTENTE
@app.route('/api/materiales/<int:id>', methods=['PUT'])
def actualizar_material(id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificamos si el material existe
        query = "SELECT IdMaterial FROM material WHERE IdMaterial = ?"
        cursor.execute(query, (id,))
        fila = cursor.fetchone()

        if not fila:
            return jsonify({"mensaje": "No se encontro el material"}), 404
        
        # Validamos los campos a actualizar
        campos_actualizables = ["nombre", "cantidad", "id_lab"]
        for campo in campos_actualizables:
            if campo not in data or data[campo] is None or data[campo] == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio y no puede ser nulo"}), 400
        if not isinstance(data["cantidad"], int) or data["cantidad"] < 0:
            return jsonify({"error": "La cantidad debe ser un número entero positivo"}), 400
        
        # Actualizamos el material
        query = "UPDATE material SET Nombre_Material = ?, Cantidad = ?, IdLaboratorio = ? WHERE IdMaterial = ?"
        cursor.execute(query, (data["nombre"], data["cantidad"], data["id_lab"], id))
        conn.commit()

        conn.close()
        return jsonify({"mensaje": "Material actualizado con éxito"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

#Eliminar un material
@app.route('/api/materiales/<int:id>', methods=['DELETE'])
def eliminar_material(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificamos si el material existe
        query = "SELECT IdMaterial FROM material WHERE IdMaterial = ?"
        cursor.execute(query, (id,))
        fila = cursor.fetchone()

        if not fila:
            return jsonify({"mensaje": "No se encontro el material"}), 404

        # Eliminamos el material
        query = "DELETE FROM material WHERE IdMaterial = ?"
        cursor.execute(query, (id,))
        conn.commit()

        conn.close()
        return jsonify({"mensaje": "Material eliminado con éxito"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
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
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscamos los registros de la bitácora específicos por su ID de laboratorio
        query = """
            SELECT 
        b.Id_bit_mat, 
        b.IdMaterial, 
        m.Nombre_Material, 
        b.Tipo,
        b.Cantidad, 
        b.Descripcion,
        b.Fecha
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
         "tipo": fila[3],
         "cantidad": fila[4],
         "descripcion": fila[5],
         "fecha": fila[6].isoformat() if fila[6] else None  # Convertimos a formato ISO para JSON
       })
        
        conn.close()
        return jsonify(bitacora), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
#OBTENER BITACORA DE INCIDENCIA POR ID DE INCIDENCIA

#OBTENER BITACORA DE INCIDENCIA POR ID DE PROFESOR


#AGREGAR NUEVO MOVIMIENTO A LA BITACORA DE MATERIALES

#ACTUALIZAR BITACORA DE MATERIALES

#ELIMINAR UN REGISTRO DE LA BITACORA DE MATERIALES
    
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
         "exp_maestro": fila[7],  # Añadimos el campo de experiencia del maestro
         "exp_alumno": fila[8]  # Añadimos el campo de experiencia del alumno
       })
        
        conn.close()
        return jsonify(bitacora), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500
    
#OBTENER BITACORA DE INCIDENCIA POR ID DE INCIDENCIA
#OBTENER BITACORA DE INCIDENCIA POR ID DE PROFESOR
#OBTENER BITACORA DE INCIDENCIA POR ID DE ALUMNO

#AGREGAR NUEVA INCIDENCIA 

#ACTUALIZAR BITACORA DE INCIDENCIA

#ELIMINAR UN REGISTRO DE LA BITACORA DE INCIDENCIA


if __name__ == '__main__':
    # Esto levanta el servidor en el puerto 5000
    app.run(debug=True, port=5000)

