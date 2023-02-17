const fs = require('fs');
const { errorLogger } = require('/home/juan/desafio-railway/loggerConfig.js');

class Messages {
  constructor(fileName) {
    this.filePath = './api/mensajes.json';
  }

  getAll = async () => {
    try {
      const archivo = await fs.promises.readFile(this.filePath);
      const productos = JSON.parse(archivo);
      console.log(`Se obtuvo el listado completo de mensajes`);

      return productos;
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to get all the messages`,
      });
    }
  };

  save = async (producto) => {
    try {
      const productos = await this.getAll();

      const id = productos.length === 0 ? 1 : productos[productos.length - 1].id + 1;

      producto.id = id;

      productos.push(producto);

      await fs.promises.writeFile(this.filePath, JSON.stringify(productos, null, 3));

      console.log(`Se salvo el mensaje con el id ${id}`);
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to save the message`,
      });
    }
  };
}

module.exports = Messages;
