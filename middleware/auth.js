const auth = (req, res, next) => {
  if (req.session?.user === 'juanchi' && req.session?.admin) {
    return next();
  } else {
    return res.status(401).send('error de autorización!');
  }
};

module.exports = { auth };
