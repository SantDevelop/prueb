const comprobarSession = async (req, res) => {
    try {
        console.log(req.session)
        if (req.session.usuario) {
            return false
        } else {
            return true
        }
    } catch (error) {
        console.log("Error, hubo un error durante la comprobacion de session", error.message)
    }
}


const blockAcceso = async (req, res) => {
    try {
        if (req.session.usuario) {
            return false
        } else {
            return true
        }
    } catch (error) {
        console.log("Error, error al restringir acceso de session", error.message)
    }
}

module.exports = {
    comprobarSession,
    blockAcceso
}