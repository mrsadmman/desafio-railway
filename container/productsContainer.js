const fs = require('fs');
const { errorLogger } = require('/home/juan/desafio-railway/loggerConfig.js');

class Products {
  constructor(filename) {
    this.filePath = `./api/productos.json`;
  }

  getAll = async () => {
    try {
      const archivo = await fs.promises.readFile(this.filePath);
      const productos = JSON.parse(archivo);
      console.log(`Se obtuvo el listado completo de productos`);

      return productos;
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to get all the products`,
      });
    }
  };

  syncGetAll = () => {
    try {
      const archivo = fs.readFileSync(this.filePath);
      const productos = JSON.parse(archivo);
      return productos;
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to get all the products`,
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

      console.log(`Se salvo el objeto con el id ${id}`);
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to save a product`,
      });
    }
  };

  getById = async (id) => {
    try {
      const productos = await this.getAll();
      const productoEncontrado = productos.find((producto) => producto.id == id);

      if (!productoEncontrado) return console.log('El id del pruducto no existe');
      console.log(`Producto encontrado con el id ${id}: ${JSON.stringify(productoEncontrado)}`);
      return productoEncontrado;
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to get a product by id`,
      });
    }
  };

  deleteById = async (id) => {
    try {
      const productos = await this.getAll();
      const productoEncontrado = productos.find((producto) => producto.id == id);

      if (!productoEncontrado) return console.log('El id del pruducto no existe');
      const productosFiltrados = productos.filter((producto) => producto.id != id);

      await fs.promises.writeFile(this.filePath, JSON.stringify(productosFiltrados, null, 3));

      console.log(`Producto con el id ${id}, borrado exitosamente!`);
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to delete by id`,
      });
    }
  };

  updateById = async (id, nombre, precio, thumbnail) => {
    try {
      const productos = await this.getAll();
      const item = productos.find((prod) => prod.id === Number(id));
      if (item) {
        item.nombre = nombre;
        item.precio = precio;
        item.thumbnail = thumbnail;
        console.log(item);
        await fs.promises.writeFile(this.filePath, JSON.stringify(productos, null, 2));
        return item;
      } else {
        return { error: 'Product not found' };
      }
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to update by id`,
      });
    }
  };

  deleteAll = async () => {
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify([], null, 3));
      console.log('Se ha borrado todo el array de productos exitosamente!');
    } catch {
      return errorLogger.log('error', {
        mensaje: `Error while trying to delete all the products`,
      });
    }
  };
}

module.exports = Products;
