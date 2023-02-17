exports.inicio = async (req, res, next) => {
    try {
        res.render('inicio')
    } catch {
        return errorLogger.log('error', {
          mensaje: `Error while trying to render inicio view`,
        });
      }
}

