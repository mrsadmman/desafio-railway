const express = require('express');
const session = require('express-session');
const config = require('./config/config');
const { warnLogger } = require('./loggerConfig');
const compression = require('compression');

console.log(`NODE_ENV=${config.NODE_ENV}`);

if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Usuarios = require('./models/usuarios');

const bcrypt = require('bcrypt');
/* import { getRoot, getLogin, getSignup, postLogin, postSignup, getFaillogin, getFailsignup, getLogout, failRoute } from "./routes.js"; */
const routes = require('./routes/routes');

const mongoose = require('mongoose');

const { engine } = require('express-handlebars');

const redis = require('redis');
const client = redis.createClient({
  legacyMode: true,
});
client
  .connect()
  .then(() => console.log('\x1b[32m', 'Connected to REDIS ✅'))
  .catch((e) => {
    return errorLogger.log('error', {
      mensaje: `No se pudo conectar a redis`,
    });
  });
const RedisStore = require('connect-redis')(session);

mongoose
  .connect('mongodb+srv://juantaphanel:w59YOPy8rzsU65eE@cluster0.ph6zyjw.mongodb.net/test')
  .then(() => console.log('\x1b[32m', 'Connected to Mongo ✅'))
  .catch((e) => {
    console.error(e);
    throw 'can not connect to the mongo! ❌';
  });

function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

passport.use(
  'login',
  new LocalStrategy((username, password, done) => {
    Usuarios.findOne({ username }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        console.log('User Not Found with username ' + username);
        return done(null, false);
      }

      if (!isValidPassword(user, password)) {
        console.log('Invalid Password');
        return done(null, false);
      }
      // no corto por error, ni corto por sin user, paso! ...
      return done(null, user);
    });
  })
);

passport.use(
  'signup',
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      Usuarios.findOne({ username: username }, function (err, user) {
        if (err) {
          res.render('usuario-registrado');
          console.log('❌ Error in SignUp: ' + err);
          return done(err);
        }

        if (user) {
          console.log('User already exists');
          return done(null, false);
        }

        const newUser = {
          username: username,
          password: createHash(password),
        };
        Usuarios.create(newUser, (err, userWithId) => {
          if (err) {
            console.log('❌ Error in Saving user: ' + err);
            return done(err);
          }
          console.log(user);
          console.log('User Registration succesful ✅');
          return done(null, userWithId);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Usuarios.findById(id, done);
});

const app = express();

app.use(
  session({
    store: new RedisStore({ host: 'localhost', port: 6379, client, ttl: 300 }),
    secret: 'keyboard cat',
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 86400000, // 1 dia
    },
    admin: true,
    rolling: true,
    resave: true,
    saveUninitialized: false,
  })
);

app.use('/public', express.static(__dirname + '/public'));
app.set('view engine', 'hbs');
app.set('views', './views');
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.get('/', routes.getRoot);
app.get('/login', routes.getLogin);
app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), routes.postLogin);
app.get('/faillogin', routes.getFaillogin);
app.get('/signup', routes.getSignup);
app.post('/signup', passport.authenticate('signup', { failureRedirect: '/failsignup' }), routes.postSignup);
app.get('/failsignup', routes.getFailsignup);
app.get('/logout', routes.getLogout);

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/ruta-protegida', checkAuthentication, (req, res) => {
  const { username, password } = req.user;
  const user = { username, password };
  const admin = JSON.stringify(req.session.admin);
  res.render('private', { layout: 'logged', user, admin });
});

app.get('/form', checkAuthentication, (req, res) => {
  res.render('form', { layout: 'logged' });
});

app.get('/showsession', (req, res) => {
  const mySession = JSON.stringify(req.session, null, 4);
  req.session.touch();
  res.json(req.session);
  /* res.render('session', { layout: 'logged', session: mySession }) */
});

app.get('/form', checkAuthentication, (req, res) => {
  res.render('form', { layout: 'logged' });
});

app.get('/products-lists', async (req, res) => {
  res.render('products-lists');
});

app.get('/productos-test', async (req, res) => {
  res.render('productos-test');
});

app.get('/chat', async (req, res) => {
  res.render('chat');
});

app.get('/info', routes.getinfo);

//Fork
app.get(`/api/randoms`, (req, res) => {
  let msg = 0;
  req.query.hasOwnProperty('cant') ? (msg = parseInt(req.query.cant)) : (msg = 10000);
  let arrayRandomNum = [];
  let arrayUsedNumber = [];
  let arrayRepeatedResult = [];
  for (let i = 0; i < msg; i++) {
    arrayRandomNum.push(Math.floor(Math.random() * 1000) + 1);
  }
  arrayRandomNum.forEach((num) => {
    if (!arrayUsedNumber.includes(num)) {
      arrayUsedNumber.push(num);
      arrayRepeatedResult.push({
        [num]: arrayRandomNum.filter((repeatedNum) => repeatedNum == num).length,
      });
    }
  });
  res.json({
    Numeros_generados: 'Usted ha generado ' + msg + ' números. Estos, agrupados por repetición, generaron un array de ' + arrayRepeatedResult.length + ' elementos',
    numeros: arrayRepeatedResult,
  });
});

app.get('*', (req, res, next) => {
  warnLogger.warn({ metodo: req.method, path: req.path });
  next();
});

//
const moment = require('moment');

const timestamp = moment().format('h:mm a');

const Messages = require('./container/messagesContainer');
const Products = require('./container/productsContainer');

const dataMsg = new Messages();
const producto = new Products();

const contenedorProductos = new Products('productos');
const productosFS = contenedorProductos.getAll();

const generateFakeProducts = require('./utils/fakerProductGenerator');
const FakeP = generateFakeProducts(5);

const { normalize, schema, denormalize } = require('normalizr');

const authorSchema = new schema.Entity('authors', {}, { idAttribute: 'email' });
const messageSchema = new schema.Entity('messages', {
  author: authorSchema,
});

const chatSchema = new schema.Entity('chats', {
  messages: [messageSchema],
});

const normalizarData = (data) => {
  const dataNormalizada = normalize({ id: 'chatHistory', messages: data }, chatSchema);
  return dataNormalizada;
};

const normalizarMensajes = async () => {
  const messages = await dataMsg.getAll();
  const normalizedMessages = normalizarData(messages);
  return normalizedMessages;
};

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

httpServer.listen(config.PORT, () => console.log(`Listening on http://${config.HOST}:${config.PORT}`));

io.on('connection', async (socket) => {
  console.log(`Nuevo cliente conectado ${socket.id}`);

  socket.emit('products-lists', await productosFS);

  socket.emit('productos-test', await FakeP);

  socket.emit('msg-list', await normalizarMensajes());

  socket.on('product', async (data) => {
    console.log('Se recibio un producto nuevo', 'producto:', data);

    await contenedorProductos.save(data);

    io.emit('products-lists', await productosFS);
  });

  socket.on('msg', async (data) => {
    await dataMsg.save({ ...data, timestamp: timestamp });

    console.log('Se recibio un msg nuevo', 'msg:', data);

    io.sockets.emit('msg-list', await normalizarMensajes());
  });
});
