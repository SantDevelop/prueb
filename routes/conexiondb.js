const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv').config()

const pool = mysql.createPool({
    database: process.env.NAME,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS
})

console.log("Conexion establecida")



const cons_comprEmail_user = `SELECT id FROM usuarios WHERE email = ?`
const cons_obtUser_user = `SELECT id, username, email, password FROM usuarios WHERE email = ?`
const cons_select_juegos = `SELECT * FROM juegos`
const cons_select_juegos_where = `SELECT * FROM juegos WHERE id = ?`



const cons_insert_user = `INSERT INTO usuarios (username, name, email, password) VALUES (?,?,?,?)`
const cons_insert_juego = `INSERT INTO juegos (titulo, descripcion, lanzamiento, portada) VALUES (?,?,?,?)`

const cons_del_juego = `DELETE FROM juegos WHERE id = ?`

const cons_mod_juego = `UPDATE juegos SET titulo = ?, descripcion = ?, lanzamiento = ?, portada = ? WHERE id = ?`


// ------------ ENCRYPT -----------
const encryptPASS = async (password) => {
    const password_hash = await bcrypt.hash(password, 10)
    return password_hash
}

const comprPASS = async (usuario, password, username) => {
    const comprobar = await bcrypt.compare(password, usuario[0].password)
    const compr_username = await username === usuario[0].username
    if (comprobar && compr_username){
        return true
    } else {
        return false
    }
}

// ------------ COMPROBAR USER -----------

const comprob_regis = async (email) => {
    const [comprobar] = await pool.query(cons_comprEmail_user, [email])
    if ( comprobar && comprobar.length > 0 ){
        console.log("El usuario se encuentra en la base de datos")
        return false
    } else {
        console.log("El usuario no existe en la base de datos")
        return true
    }
}


// ------------ OBTENER DATOS -----------
const obtDatosUser = async (email) => {
    try {
        const [usuario] = await pool.query(cons_obtUser_user, [email])
        if (usuario && usuario.length > 0) {
            return usuario
        } else {
            return false
        }
    } catch (error) {
        console.log("Error al obtener datos del usuario", error.message)
    }
}

const obtJuegos = async () => {
    try {
        const [juegos] = await pool.query(cons_select_juegos)
        if (juegos.length > 0){
            return juegos
        } else {
            console.log("No hay juegos que mostrar")
            return false
        }
    } catch (error) {
        console.log("Error al obtener los datos de juegos de la base de datos", error.message)
    }
}


const obtJuego = async (id) => {
    try {
        const [juego] = await pool.query(cons_select_juegos_where, [id])
        if (juego.length > 0){
            return juego[0]
        } else {
            return false
        }
    } catch (error) {
        console.log("Error al obtener el juego")
    }
}


// ------------ AÑADIR -----------

const insertUser = async (usuario) => {
    pool.execute (cons_insert_user, [usuario.username, usuario.name, usuario.email, usuario.password_hashed])
}

const insertJuego = async (juego) => {
    pool.execute (cons_insert_juego, [juego.titulo, juego.descripcion, juego.lanzamiento, juego.portada])
}


// ------------ ELIMINAR -----------

const deleteJuego = async (id) => {
    pool.execute(cons_del_juego, [id])
}

// ------------ MODIFICAR -----------

const editarJuego = async (id) => {
    const [juego] = await pool.query(cons_select_juegos_where, [id])
    return juego[0]
}

const modJuego = async (juego) => {
    pool.query(cons_mod_juego, [juego.titulo, juego.descripcion, juego.lanzamiento, juego.portada, juego.id])
}



module.exports = {
    encryptPASS, 
    comprPASS,
    comprob_regis,
    insertUser,
    obtDatosUser,
    insertJuego,
    obtJuegos,
    deleteJuego,
    modJuego,
    obtJuego,
    editarJuego
}