const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { encryptPASS, comprPASS, comprob_regis, insertUser, obtDatosUser, insertJuego, obtJuegos, deleteJuego, modJuego, obtJuego, editarJuego } = require('./conexiondb')


const verificarToken = (req, res, next) => {
    const token = req.cookies.id
    if (!token) {
        return res.status(401).send('Acceso no autorizado. Debes iniciar sesión.')
    }
    jwt.verify(token, process.env.SECRETO, (err, decoded) => {
        if (err) {
            return res.status(401).send('Acceso no autorizado. Token no válido.')
        }
        req.usuario = decoded
        next()
    })
}

const esAdmin = (id) => {
    return id === process.env.ID_ADMIN
}


router.get('/', async (req, res) => {
    res.render('selecc')
})

router.get('/regisPage', (req, res) => {
    res.render('register')
})

router.get('/loginPage', (req, res) => {
    res.render('login')
})

router.post('/register', async (req, res) => {
    try {
        const { username, name, email, password } = req.body
        password_hashed = await encryptPASS(password)
        const comprobar = await comprob_regis(email)
        if (comprobar) {
            await insertUser({username, name, email, password_hashed})
            res.redirect('/loginPage')
        } else {
            res.send("El usuario ya está registrado, o el correo ya está en uso")
        }
    } catch (error) {
        console.log("No se pudo regitrar el usuario", error.message)
    }

})

router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body
        const usuario = await obtDatosUser(email)
        if (usuario) {
            const comprob_PASS = await comprPASS(usuario, password, username)
            console.log(comprob_PASS)
            if (comprob_PASS) {
                const idAdmin = parseInt(process.env.ID_ADMIN)
                const esAdmin = (usuario[0].id === idAdmin)
                const token = jwt.sign({ 
                    id_token: usuario[0].id, 
                    esAdmin: esAdmin 
                }, process.env.SECRETO)
                res.cookie('id', token, { httpOnly: true })
                res.redirect('/verjuegos')
            } else {
                res.send("Datos incorrectos")
            }
        } else {
            res.send("El usuario no existe")
        }
    } catch (error) {
        console.log("No se pudo loguear el usuario", error.message)
    }
})

router.use(verificarToken)


router.get('/cabeSel', async (req, res) => {
    if (req.usuario.esAdmin) {
        res.render('inserJuego');
    } else {
        res.status(403).send('Acceso prohibido. No tienes los permisos necesarios.');
    }
    // res.render('inserJuego')
})

router.post('/inJuego', async(req, res) => {
    try {
        const { titulo, lanzamiento, descripcion, portada } = req.body
        await insertJuego({titulo, lanzamiento, descripcion, portada})
        res.redirect('/verjuegos')
    } catch (error) {
        console.log("ERROR: error al insertar el juego", error.message)
        return
    }
})

router.get('/verjuegos', async (req, res) => {
    try {
        const juegos = await obtJuegos()
        res.render('home', {juegos: juegos})
    } catch (error) {
        console.log("Error al mostrar los juegos", error.message)
    }
})

router.post('/eliminar', async (req, res) => {
    try {
        if (req.usuario.esAdmin){
            const { id } = req.body
            await deleteJuego(id)
            res.redirect('/verjuegos')
        } else {
            res.sendStatus(403, "Acceso no permitido")
        }
        
    } catch (error) {
        console.log("Error al eliminar el juego", error.message)
    }
})

router.post('/modificar', async (req, res) => {
    if (req.usuario.esAdmin){
        const { id } = req.body
        const juego = await editarJuego(id)
        res.render('modjuego', {juego: juego})
    } else {
        res.sendStatus(403, "Acceso no permitido")
    }
})

router.post('/modijuego', async (req, res) => {
    const juego = req.body
    try {
        await modJuego(juego)
        res.redirect('/verjuegos')
    } catch (error) {
        console.log("Error al modificar el juego")
        res.redirect('/verjuegos')
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie('id')
    res.redirect('/')
})


module.exports = router