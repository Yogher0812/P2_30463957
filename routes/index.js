const ContactosController = require("../controllers/ContactosController");
const contactosController = new ContactosController();

const indexControllers = require("../controllers/indexControllers");


var express = require("express");
var router = express.Router();

router.get("/", indexControllers);

router.post("/guardar_contacto", contactosController.add);

module.exports = router;