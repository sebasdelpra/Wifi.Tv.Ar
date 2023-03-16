const { createBot, createProvider, createFlow, addKeyword,  EVENTS} = require('@bot-whatsapp/bot')



const QRPortalWeb = require('@bot-whatsapp/portal')
const MockAdapter = require('@bot-whatsapp/database/mock')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')
const { xml2json } = require('xml-js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

//GOOGLE SHEET INICIO
const { GoogleSpreadsheet } = require('google-spreadsheet');

// File handling package
const fs = require('fs');

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = '1q2djF-iezoG5vrYtGwQFHkHd-uoXQyfIGrHO0gz1j8w';

// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('./credenciales.json'));
//GOOGLE SHEET FINAL
const flowInicial = addKeyword(EVENTS.WELCOME).addAnswer('Bienvenido a este BOT para acceder al menu escribe *HOLA*')

//----------------------------------------------------------------------------------------
// SDK de Mercado Pago
const mercadopago = require('mercadopago');
const { resolve } = require('node:path');
const { Console } = require('console');
const { devNull } = require('os')

mercadopago.configure({
    access_token:'TEST-4075010836840184-022218-ef168bef5a580dcc7e0b39186924ed4d-187906500'
})

//----------------------------------------------------------------------------------------

/**
 * Declaramos las conexiones de MySQL

const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'root'
const MYSQL_DB_PASSWORD = '142857Mysql'
const MYSQL_DB_NAME = 'schemachat'
const MYSQL_DB_PORT = '3306'
 */

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */


const flowSecundario = addKeyword(['000', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

let telefono;
let deuda;
let STATUS=[];
  //{body:'Lo ves en tu celu y en 3 dispositivos a la vez \n son 110 canales \n Pago anticipado \n '}
  const flowMercadoPago = addKeyword('Pagar con Mercado Pago')
    .addAnswer(
      ['📟 demora unos segundos'],    
      { capture: true, buttons: [{body: 'generar el pago'}] },
      async (ctx, {  flowDynamic, endFlow }) => {
      if (ctx.body == 'generar el pago') 
        {            
          { 
            let respuesta;
                let preference = {
                    back_urls: { 
                        success: 'http://localhost:3000/success'
                    },
                        items: [
                            {
                                title: 'Deuda de WIFI TV',
                                unit_price: parseFloat(STATUS[telefono].deuda),
                                quantity: 1,
                                currency_id:'ARS'
                            },                        
                        ],
                        };
                    console.log(preference);
                await mercadopago.preferences
                        .create(preference)
                        .then(async function(response, resolve){
                                // Este valor reemplazará el string "<%= global.id %>" en tu HTML
                                global.id = response.body.id;
                                console.log(global.id);
                        
                            respuesta = response.body.init_point;
                            await flowDynamic({media: 'https://www.boutiqueautomovil.com.ar/wp-content/uploads/2019/05/logo-mercadopago.png'})
                            await flowDynamic(`${respuesta}`)  
                }).catch(function(error){
                    console.log(error);
                });              
        }
        }
     })
     .addAnswer(
        [`hace clic aquí👇`],
        { capture: false, buttons: [{ body: '⬅️ Volver' }] },
    
        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '⬅️ Volver')
             return endFlow()          
        }
    )
    
    
let codigoCliente;
let xTexto;

const flowSaldo = addKeyword(['Consulta tu saldo'])  
.addAnswer(
    ['Ingresar numero de socio, ' ,'Buscar en facturas anteriores'],
    { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

    async (ctx, { flowDynamic, endFlow, fallBack }) => {

        const stringWithNumbers = ctx.body;
        const onlyNumbers = stringWithNumbers.replace(/[^0-9]+/g, ""); // esto retorna '1234'
        codigoCliente = onlyNumbers.padStart(6,'0')         
        codigoCliente = codigoCliente.slice(0,6)
            
        console.log(codigoCliente + '<- Cliente')
        if (ctx.body == '❌ Cancelar solicitud' || codigoCliente == '000000')
         return endFlow({body: '❌ Su solicitud ha sido cancelada', 
             buttons:[{body:'⬅️ Volver' }]                     
        })

    // VER QUE LA MAQUINA TENGA CURL
    let cUrl = `curl -H "Accept: application/json" -H "Content-Type: application/json" -H "api-key: iaIk89s3TdMLoZoEivD5GCT5dm76aENxN3lksc0wcazZhNjtjJ0mWPD7" -H "api-token: CEotoscTzhidht35G0Pwo7laz89i0NoD" http://online7.ispcube.com:8080/index.php/customers?idcustomer=${codigoCliente}`;
    
    const util = require('node:util');
    const exec = util.promisify(require('node:child_process').exec);

    console.log(cUrl)

            const { stdout, stderr } = await exec(cUrl);
            //console.log('stdout:', stdout);s
            //console.error('stderr:', stderr);
            let pepe  = stdout.toString(); 
            console.log(pepe);
            console.log(pepe.length);
          //  pepe=pepe.replace('[','').replace(']','')

            if ( pepe.length < 60 ) {
                 await flowDynamic('NO SE ENCONTRO INFORMACION DE ESE NUMERO DE CLIENTE')
                 return endFlow()    
            }
            else
            {
                var regex = /(\d+)/g;

                let idcustomerN  = pepe.indexOf('"idcustomer"');
                let idcustomerC  = pepe.slice(idcustomerN+14, idcustomerN+14 + 6)  ;
                let idName       = pepe.indexOf('"name"');
                let idNameC      = pepe.slice(idName+8, idName +8 + 50)  ;
                    idNameC      = idNameC.slice(0,idNameC.indexOf('"'));
                let idAddress    = pepe.indexOf('"address"');
                let idAddressC   = pepe.slice(idAddress+11, idAddress +11 + 50);
                    idAddressC   = idAddressC.slice(0,idAddressC.indexOf('"'));
                let idExtra1     = pepe.indexOf('"city"');
                let idExtra1C    = pepe.slice(idExtra1+11, idExtra1 +11 + 20)  ;
                    idExtra1C    = idExtra1C.slice(0,idExtra1C.indexOf('"'));
                let idExtra2     = pepe.indexOf('"state"');
                let idExtra2C    = pepe.slice(idExtra2+9, idExtra2 +9 + 20)  ;
                    idExtra2C    = idExtra2C.slice(0,idExtra2C.indexOf('"'));
                let idDeuda      = pepe.indexOf('"debt"',1);
                let idDeudaC     = pepe.slice(idDeuda+8, idDeuda + 8 + 20)  ;
                    deuda     = idDeudaC.slice(0,idDeudaC.indexOf('"'));
                
                xTexto = 
                `*Nº de cliente:* ${idcustomerC} \n`+
                ` *Nombre       :* ${idNameC}     \n`+
                ` *Direccion    :* ${idAddressC}  \n` +
                ` *Localidad    :* ${idExtra1C}   \n` +
                ` *Provincia    :* ${idExtra2C}   \n` +  
                ` *DEUDA        :* $${deuda}    `  
                
        
                telefono = ctx.from

                idcustomerC = STATUS[telefono] = {...STATUS[telefono], idcustomerC}  

                STATUS[telefono].idcustomerC = idcustomerC
                STATUS[telefono].deuda = deuda
                console.log(STATUS[telefono].deuda)
        
                await flowDynamic(`Los datos obtenidos son:\n ${xTexto}`)
                return endFlow()    
        }
    }
)
.addAnswer(
    [`hace clic aquí👇`],
    { capture: false, buttons: [{ body: '⬅️ Volver' }] },

    async (ctx, { flowDynamic, endFlow }) => {
        if (ctx.body == '⬅️ Volver')
         return endFlow()          
    }
)
 

const flowFacturacion = addKeyword(['Facturación'])    
    .addAnswer('Elegí una de las siguientes opciones para que podamos ayudarte', 
        {buttons : [
            {body:'Consulta tu saldo'}, 
            {body:'Pagar con Mercado Pago'},            
        ]
    }
 )

 const flowFutbol = addKeyword('Pack FUTBOL')        
 .addAnswer(
     ['*TENDRAS ACCESO A TODOS LOS PARTIDOS DE FUTBOL NACIONALES E INTERNACIONALES*' ,'se te avisara por correo electronico el alta a este servicio dentro de las 24 hs hábiles'],
     { capture: false, buttons: [{ body: '⬅️ Volver' }] },
 
     async (ctx, { flowDynamic, endFlow }) => {
         if (ctx.body == '⬅️ Volver')
          return endFlow()          
     }
 )
  
 const flowHBO = addKeyword('Pack HBO')        
 .addAnswer(
     ['*TENDRAS ACCESO A HBO EN TODAS LAS CATEGORIAS*' ,'se te avisara por correo electronico el alta a este servicio dentro de las 24 hs hábiles'],
     { capture: false, buttons: [{ body: '⬅️ Volver' }] },
 
     async (ctx, { flowDynamic, endFlow }) => {
         if (ctx.body == '⬅️ Volver')
          return endFlow()          
     }
 )

const flowPaquetes = addKeyword(['Contratar paquetes']) 
.addAnswer(
    ['Tenemos 2 opciones de paquetes FULL'],
    { buttons: [{body: 'Pack FUTBOL'},{body: 'Pack HBO'}] }, 
)
     
 

const flowSuscripcion = addKeyword('Como suscribirme')        
.addAnswer(
    ['Mandar mensajes unicamente al *+5493755538935* en el horario de 10 a 18hs de lunes a viernes (UNICAMENTE)'],
    { capture: false, buttons: [{ body: '⬅️ Volver' }] },

    async (ctx, { flowDynamic, endFlow }) => {
        if (ctx.body == '⬅️ Volver')
         return endFlow()          
    }
)

const flowRepresentante = addKeyword('Hablar con un representante')        
.addAnswer(
    ['Llamar al *+5493755538935* en el horario de 10 a 18hs de lunes a viernes (UNICAMENTE)'],
    { capture: false, buttons: [{ body: '⬅️ Volver' }] },

    async (ctx, { flowDynamic, endFlow }) => {
        if (ctx.body == '⬅️ Volver')
         return endFlow()          
    }
)

var apellidoynombre;
var correo;
var celular;
var tiene = 0;
var dFechaSolicitud;

const flowDemo = addKeyword(['Solicitar DEMO']) 
.addAnswer(
    ['Para suscribirte necesito unos datos...' ,'Escribe tu *Nombre y Apellido*'],
    { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

    async (ctx, { flowDynamic, endFlow }) => {
        if (ctx.body == '❌ Cancelar solicitud')
         return endFlow({body: '❌ Su solicitud ha sido cancelada',   
             buttons:[{body:'⬅️ Volver'}]                       
        })
        apellidoynombre = ctx.body
        return flowDynamic(`Encantado *${apellidoynombre}*, continuamos...`)
    }
)
.addAnswer(
    ['Ahora ingresar el correo'],
    { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

    async (ctx, { flowDynamic, endFlow, fallBack }) => {

      //  if (!ctx.body.includes('@')){
      //      return fallBack('Veo que no es um mail ')
      //  }           

        if (ctx.body == '❌ Cancelar solicitud') 
            return endFlow({body: '❌ Su solicitud ha sido cancelada ',
                buttons:[{body:'⬅️ Volver' }]
    })
    correo = ctx.body      
    celular = ctx.from
    
//
 
//primero ve si existe si es asi alerta que ya solicito la demo
//caso contrario.. permite

const getRow = async (celular) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    // load the documents info
    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    // Get all the rows
    let rows = await sheet.getRows();

        for (let index = 0; index < rows.length; index++) {   
            const row = rows[index];
            if (row.Telefono == celular) {         
                console.log(row.Telefono);
                console.log(row.Correo);
                console.log(row.NombreApellido);
                console.log(row.CorreoDemo);            
                console.log(row.FechaSolicitud);
                console.log(row.FechaFinal);
                
                dFechaSolicitud = row.FechaSolicitud;             
                tiene = 1;
            }
        };
    //await delay(1500)
};

const addRow = async (rows) => {

    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            await sheet.addRow(row);
        }
    };

    // crea un nuevo objeto `Date`
    var today = new Date(); 
    // obtener la fecha y la hora
    var now = today.toLocaleString();

    let rows = [
        {
            Telefono: `${celular}`,
            Correo: `${correo}` ,
            NombreApellido: `${apellidoynombre}`,    
            CorreoDemo: '',
            FechaSolicitud: now,
            FechaFinal: ''
        }
];

await getRow(celular);


console.log(tiene+'===================================');
console.log(celular+'===================================');
console.log(dFechaSolicitud+'===================================')
    if ( tiene == 0 )
        {
        addRow(rows);
        return flowDynamic(`Te dejo el resumen de tu formulario
            \n- Desde el celular : *${celular}*
            \n- Nombre/apellido: *${apellidoynombre}*
            \n- Correo: *${correo}*            
            \nSe te estará enviando a tu correo en las próximas horas, las credenciales para acceder por 24 Hs.
            \n*QUE LO DISFRUTES*`)
        }
    else
        {
            return   flowDynamic(`Ya habías solicitado 
            \n- el dia: *${dFechaSolicitud}*
            \ndesde este celular no puedo otorgarte otra, lo siento `)
        }   
}    
)

.addAnswer(
    [' '],
    { capture: false, buttons: [{ body: '⬅️ Volver' }] },

    async (ctx, { flowDynamic, endFlow }) => {
        if (ctx.body == '⬅️ Volver')
         return endFlow()          
    }
)


const flowWifiTvQueEs = addKeyword('¿Que es Wifi TV?')    
    .addAnswer(['*Detalle general del servicio*',    
                ' ⭐Es TV DIGITAL + *110 CANALES* en HD',
                ' ⭐Lo ves en el celu',
                '    y en 3 dispositivos más',
                ' ⭐Pagas anticipado el costo es de 3.300 $',
                ' ⭐Podes contratar packs Futbol $ 1.900 / HBO $ 650 por mes y lo desactivas cuando quieras',  
                ' ⭐Lo podes usar fuera del país',  
                ' ⭐Esta plataforma es homologada y certificada por Google, Samsung, Amazone y LG',  
                ' ⭐Funciona con Android TV , TV BOX, STICK ',  
                '   si no lo tenes te proveemos un dispositivo que conectas a la tele o te conseguís un Chromecast',  
                ' ⭐Usas cualquier conexión de internet'  ])

    .addAnswer('*¿Y ahora, como sigo?*', 
    {buttons : [
        {body:'Como suscribirme'}, 
        {body:'Solicitar DEMO'},
        {body:'Contratar paquetes'}
   ]
   })
 
   
      
    
const flowPrincipal = addKeyword(['0','hola', 'buenas', 'volver','inicio','⬅️ Volver al Inicio'])
    .addAnswer('🙌 Hola bienvenido a  *Wifi Tv Bot*')    
    .addAnswer('Elegí una de las siguientes opciones para que podamos ayudarte', 
        {buttons : [
            {body:'¿Que es Wifi TV? 📡💻'}, 
            {body:'Facturación ✉️'},
            {body:'Hablar con un representante'}
        ]
    }
 )


const main = async () => {
    const adapterDB = new MockAdapter()   

    const adapterFlow = createFlow([flowInicial,flowPrincipal, flowWifiTvQueEs,flowDemo,flowSuscripcion,flowPaquetes,flowFacturacion, flowSaldo,flowMercadoPago,flowFutbol,flowHBO,flowRepresentante])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
     
    QRPortalWeb()
}
main()
