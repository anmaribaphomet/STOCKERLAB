from flask import Flask, jsonify, request
import pyodbc

app = Flask(__name__)

# Función central para conectar a la base de datos
def get_db_connection():
    # Esta cadena funcionará tanto en tu PC física AHORA, como en la VM después.
    # ¡No tendrás que cambiar ni una sola línea de código al pasar a Producción!
    conexion = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=db.stockerlab.local;'  # Tu dominio DNS configurado
        'DATABASE=stockerlab;'         # El nombre de la base de datos que creaste
        'UID=Super_Stocker;'      # El usuario que debes crear en SQL Server (PROHIBIDO usar 'sa')
        'PWD=Windows2016'      # La contraseña de ese usuario
    )
    return conexion

# --------------------------------------------------------
# 1. Componente Visual del Documento: PING AL SERVIDOR
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
            "mensaje": "Conexión a db.stockerlab.local exitosa"
        }), 200
        
    except Exception as e:
        # Si falla (ej. VM apagada), le decimos al frontend que marque error
        return jsonify({
            "status": "offline", 
            "error": str(e)
        }), 500



# RUTA A: Obtener la lista de materiales de un laboratorio específico
# JavaScript usará: fetch('/api/materiales/1')
@app.route('/api/materiales/<int:id>', methods=['GET'])
def obtener_material_por_id(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Buscamos el material específico por su ID único
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
        return jsonify({"error": str(e)}), 500


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
            INSERT INTO material (Nombre_Material, Cantidad, Idlaboratorio) VALUES (?, ?, ?)
        """
        cursor.execute(query, (data["nombre"], data["cantidad"], data["id_lab"]))
        
        conn.commit()
        nuevo_id = cursor.lastrowid 

        conn.close()

        return jsonify({
            "mensaje": "Material registrado con éxito",
            "id": nuevo_id
        }), 201

    except Exception as e:
       return jsonify({"error": str(e)}), 500
# --------------------------------------------------------
# INICIO DEL SERVIDOR DE DESARROLLO
# --------------------------------------------------------
if __name__ == '__main__':
    # Esto levanta el servidor de pruebas en tu máquina física en el puerto 5000
    app.run(debug=True, port=5000)

