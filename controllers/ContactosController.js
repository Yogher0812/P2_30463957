const ContactosModel = require("../models/ContactosModels");

class ContactosController {
  constructor() {
    this.contactosModel = new ContactosModel();
    this.add = this.add.bind(this);
  }

  async add(req, res) {

    const { email, name, mensaje } = req.body;

    if (!email || !name || !mensaje) {
      res.status(400).send("Faltan campos requeridos");
      return;
    }

    const ip = req.ip;
    const fecha = new Date().toISOString();


    await this.contactosModel.crearContacto(email, name, mensaje, ip, fecha);

    const contactos = await this.contactosModel.obtenerAllContactos();

    console.log(contactos);

    
    res.redirect("/");
  }
}

module.exports = ContactosController;