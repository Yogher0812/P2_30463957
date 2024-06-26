require('dotenv').config();
const {CLAVESITIO,CLAVESECRETA,PASSWORDAPP} = process.env;
const express = require('express');
//let handlebars = require('express-handlebars')
const cors = require('cors');
const connectedSockets = new Set();
const http = require('http');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const axios = require('axios');
const Controllers = require('./controllers/controllersContacto.js');
const controllers = new Controllers();
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha(CLAVESITIO,CLAVESECRETA);

const BaseDatos = require('./models/conexion.js');

const db = new BaseDatos();

const { Server } = require('socket.io');

const server = http.createServer(app);



//Mensaje al destinatario
const transporter = nodemailer.createTransport({
  service:'Gmail',
   auth:{
    user:'programacionjavascript9@gmail.com',
    pass:PASSWORDAPP
  }
});
//recursos que se van a cargar en el server 
app.use(express.static(__dirname+'/static'));

//Configuración de las plantillas
// Habilitar CORS para todas las rutas
app.use(cors());

app.set('view engine','ejs');//definimos el motor de plantilla con archivos ejs
app.set('views',path.join(__dirname,"./views"));//definimos la ruta del motor de plantilla

app.use(express.urlencoded({extended:false}));//permite recuperar los valores publicados en un request
app.use(cookieParser());
app.use(express.json());
// Rutas y lógica de tu aplicación


app.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err){
    res.status(500).json({error:'Error el en servidor'});
  }
});

//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////

app.get('/ubicacion', async (req, res) => {

  let lat = req.query.lat;

  let lng = req.query.lng;
  console.log(`lat : ${lat} lng : ${lng}`);

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  const config = {
  headers:{
    'Referer': 'https://curriculum-upeh.onrender.com', // Establece el Referer personalizado
    'User-Agent': 'curriculumVitae' // Establece el User-Agent personalizado
  },
  timeout: 60000 // 60 segundos
};
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,config);
    //res.json(response.data);
    res.cookie('location',response.data.address.country, { httpOnly: true, secure: true });
    res.json(response.data.address.country);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the data' });
  }
});
//////////////////////////////////////////////////////////
app.post('/contacto',recaptcha.middleware.verify,async (req,res)=>{
try{
   if(!req.recaptcha.error){

    let pais = req.cookies.location;
    // El reCAPTCHA se ha verificado correctamente
    const {nombre,email,comentario} = req.body;
//De esta forma obtenemos la direccion ip que seria ::1 que es la representación de la dirección IP de loopback IPv6 en IPv4 segun randy...
  const ip = req.ip;
  const respuesta = await controllers.add(nombre,email,comentario,ip,pais);
    // Detalles del correo electrónico
  const mailOptions = {
    from:'programacionjavascript9@gmail.com',
    to: 'programacion2ais@dispostable.com', // Agrega aquí la dirección de correo a la lista de destinatarios
    subject: '¡Un usuario a enviado un mensaje!',
    text: `Datos del usuario:\n\n
           Nombre: ${nombre}\n
           Email: ${email}\n
           Comentario: ${comentario}\n
           ip: ${ip}\n
           pais: ${pais}\n`
  };

  // Envío del correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {

    if (error) {
      console.log('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado al destinatario: programacion2ais@dispostable.com', info.response);
    }

  });
  console.log(`Respuesta de controlador : ${respuesta}`);
  res.redirect('/');
  } else{
    // El reCAPTCHA no se ha verificado correctamente
    res.send('Error en el reCAPTCHA');
  } 
 
}catch(error){
console.error(error.message);
res.status(500).json({error:'Error en el servidor'});
}

});
//////////////////////////////////////////////////////////////////////
  
// Otros endpoints y lógica de tu aplicación
const port = 3000;
server.listen(port,()=>{
  console.log(`Servidor Express iniciado en el puerto ${port}`);
});

process.on('SIGINT',()=>{
  db.close();
  process.exit();
});