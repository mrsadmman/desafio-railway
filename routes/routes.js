const parseArgs = require('minimist');
const { fork } = require("child_process");

function getRoot(req, res) {
  res.render('index', {});
}

function getLogin(req, res) {
  if (req.isAuthenticated()) {
    const { username, password } = req.user;
    const user = { username, password };
    res.render('profileUser', { layout: 'logged', user });
  } else {
    res.render('login');
  }
}

function getSignup(req, res) {
  if (req.isAuthenticated()) {
    const { username, password } = req.user;
    const user = { username, password };
    res.render('profileUser', { layout: 'logged', user });
  } else {
    res.render('signup');
  }
}

function postLogin(req, res) {
  const { username, password } = req.user;
  const user = { username, password };
  req.session.admin = true;
  res.render('profileUser', { layout: 'logged', user });
}

function postSignup(req, res) {
  const { username, password } = req.user;
  const user = { username, password };
  res.render('profileUser', { layout: 'logged', user });
}

function getFaillogin(req, res) {
  res.render('login-error', {});
}

function getFailsignup(req, res) {
  res.render('signup-error', {});
}

function getLogout(req, res) {
  const { username, password } = req.user;
  const user = { username, password };
  res.render('logout', { user });
  req.logout();
}

function failRoute(req, res) {
  res.status(404).render('routing-error', {});
}

function getinfo(req, res) {
  const argumentos = JSON.stringify(parseArgs(process.argv.slice(2))._);
  const path = JSON.stringify(process.env.PATH);
  const PID = process.pid;
  const version = process.version;
  const carpeta = process.env.PWD;
  const OS = process.platform;
  const memoryUsage = process.memoryUsage().rss;

  const data = {
    argumentos: argumentos,
    path: path,
    PID: PID,
    version: version,
    carpeta: carpeta,
    OS: OS,
    memoryUsage: memoryUsage,
  };

  res.render('info', {
    argumentos: argumentos,
    path: path,
    PID: PID,
    version: version,
    carpeta: carpeta,
    OS: OS,
    memoryUsage: memoryUsage,
    views: 'info',
  });
}

function getApiRandom(req, res) {
  let cant
  let cantidad = req.query.cant || 100000

  let proceso = fork("./child.js");

  proceso.send({cantidad});

  proceso.on("message", (msg) => {
    const { data } = msg;
    res.json(data);
  });

  
}
module.exports = {
  getRoot,
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  getFaillogin,
  getFailsignup,
  getLogout,
  failRoute,
  getinfo,
  getApiRandom,
};
