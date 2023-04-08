/*
0️⃣
1️⃣
2️⃣
3️⃣
4️⃣
5️⃣
6️⃣
7️⃣
8️⃣
9️⃣
#️⃣
*️⃣
*/

const { createBot, createProvider, createFlow, addKeyword,  EVENTS} = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const MockAdapter = require('@bot-whatsapp/database/mock')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const express = require('express')
const axios = require('axios')

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
.addAnswer(`👋¡Saludos`, {delay:2000}, async (ctx,{flowDynamic}) => {
    Nombres=ctx.pushName     
   await flowDynamic(`¡Hola ${Nombres}, te voy a explicar todo lo que necesites sobre este servicio`)   
})

 



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


 // const flowcuentas = addKeyword(['Mediante depósito o transferencia', 'Cuentas']).addAnswer(
  //  ['Puede demorar un momento\n luego acceda al link generado'],//
 //   {media:'https://www.boutiqueautomovil.com.ar/wp-content/uploads/2019/05/logo-mercadopago.png'})
 //   .addAnswer('selecciona una de estas opciones',{buttons:[{body:'Ya he realizado mi pago, adjunto foto'},{body:'Tengo unas preguntas'}]},null,[tengoPreguntas])


  const flowMercadoPago = addKeyword('7')
    .addAnswer(
        ['Puede demorar un momento'],      
        {media:'https://www.boutiqueautomovil.com.ar/wp-content/uploads/2019/05/logo-mercadopago.png'}        
    )
    .addAnswer('luego acceda al link generado ',
       
      { capture: false},
      async (ctx, {  flowDynamic, endFlow, gotoFlow }) => {

        console.log(ctx.body)

      if (ctx.body == '7') 
        {            
            if (deuda == null || deuda === undefined || deuda == 0 )
            {
                await flowDynamic('El importe a pagar no puede ser cero\nacceda antes a \n*Consultar mi saldo* ')  
               // return  endFlow()
            }
            else
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
                           // await flowDynamic({media: 'https://www.boutiqueautomovil.com.ar/wp-content/uploads/2019/05/logo-mercadopago.png'})
                            await flowDynamic(`${respuesta}`)  
                }).catch(function(error){
                    console.log(error);
                });              
        }
        }    
     })
.addAnswer(
    ['0️⃣ Volver al inicio'],
    { capture: true },

    async (ctx, { flowDynamic, endFlow , fallBack, gotoFlow}) => {
        if (ctx.body == '0'){              
            return  gotoFlow(flowPrincipal)
            }
            else
            {
                return fallBack('Seleccionar lo sugerido')
            }        
        }
)

    
let codigoCliente;
let xTexto;

const flowSaldo = addKeyword(['6'])  
.addAnswer(
    ['Ingresar *número* de socio, ' ,'Buscar en facturas anteriores','\n0️⃣ Volver al inicio'],
    
    { capture: true},    
       async (ctx, { flowDynamic, endFlow, gotoFlow,fallBack }) => {
   

        const stringWithNumbers = ctx.body;
        const onlyNumbers = stringWithNumbers.replace(/[^0-9]+/g, ""); // esto retorna '1234'
        codigoCliente = onlyNumbers.padStart(6,'0')         
        codigoCliente = codigoCliente.slice(0,6)
            
        console.log(codigoCliente + '<- Cliente')
        if (ctx.body == '0' || codigoCliente == '000000')      
          { 
            return  gotoFlow(flowPrincipal)
          }
   

            // VER QUE LA MAQUINA TENGA CURL
            let cUrl = `curl -H "Accept: application/json" -H "Content-Type: application/json" -H "api-key: iaIk89s3TdMLoZoEivD5GCT5dm76aENxN3lksc0wcazZhNjtjJ0mWPD7" -H "api-token: CEotoscTzhidht35G0Pwo7laz89i0NoD" http://online7.ispcube.com:8080/index.php/customers?idcustomer=${codigoCliente}`;
            
            const util = require('node:util');
            const exec = util.promisify(require('node:child_process').exec);

            //console.log(cUrl)

                    const { stdout, stderr } = await exec(cUrl);
                    //console.log('stdout:', stdout);s
                    //console.error('stderr:', stderr);
                    let pepe  = stdout.toString(); 
            
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
                        ` *Nombre      :* ${idNameC}     \n`+
                        ` *Direccion   :* ${idAddressC}  \n` +
                        ` *Localidad   :* ${idExtra1C}   \n` +
                        ` *Provincia   :* ${idExtra2C}   \n` +  
                        ` *DEUDA       :* ${deuda}    `  
                        
                
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
    ['0️⃣ Volver al inicio'],
    { capture: true },

    async (ctx, { flowDynamic, endFlow , fallBack, gotoFlow}) => {
        if (ctx.body == '0'){              
            return  gotoFlow(flowPrincipal)
            }
            else
            {
                return fallBack('Seleccionar lo sugerido')
            }        
        }
)
 

const flowFacturacion = addKeyword(['Facturación'])    
    .addAnswer('¿Que quieres hacer?.', 
        {buttons : [
            {body:'Consultar mi saldo'}, 
            {body:'Pagar con Mercado Pago'},            
        ]
    }
 )


const flowFutbol = addKeyword('Pack FUTBOL')        
.addAnswer(
   ['*TENDRAS ACCESO A TODOS LOS PARTIDOS DE FUTBOL NACIONALES E INTERNACIONALES*' ,
    'se te avisara por correo electronico el alta a este servicio dentro de las 24 hs hábiles',
    '\n0️⃣ Volver al inicio'], 
   { capture: true},    
       async (ctx, { flowDynamic, endFlow, gotoFlow,fallBack }) => {
           if (ctx.body == '0'){              
               return  gotoFlow(flowPrincipal)
               }
               else
               {
                   return fallBack('Seleccionar lo sugerido')
               }        
           }
   )

const flowHBO = addKeyword('Pack HBO')        
.addAnswer(
   ['*TENDRAS ACCESO A HBO EN TODAS LAS CATEGORIAS*' ,
   'se te avisara por correo electronico el alta a este servicio dentro de las 24 hs hábiles',
   '\n0️⃣ Volver al inicio'], 
   { capture: true},    
       async (ctx, { flowDynamic, endFlow,gotoFlow, fallBack }) => {
           if (ctx.body == '0')
               {
                   return  gotoFlow(flowPrincipal)
               }
               else
               {
                   return fallBack('Seleccionar lo sugerido')
               }        
           }
   )

const flowPaquetes = addKeyword(['5']) 
.addAnswer(
   ['Tenemos 2 opciones de paquetes FULL','\n1️⃣Pack FUTBOL','2️⃣Pack HBO','\n0️⃣ Volver al inicio'],  
   { capture: true},    
   async (ctx, { flowDynamic, endFlow, fallBack, gotoFlow }) => {
       if (!['1','2','0'].includes(ctx.body)){
           return fallBack('Selecciona una de las opciones')
       }       
       else
       {
       if (ctx.body == '1')
       {
           console.log(ctx.body)           
           return gotoFlow(flowFutbol)
       }        
       else
       {
       if (ctx.body == '2')
       {
            return gotoFlow(flowHBO)
       }                      
   }    
}}
)

const flowSuscripcion = addKeyword('2')        
.addAnswer(
    ['Mandar mensajes unicamente al *+5493755538935* ,\nen el horario de 10 a 18hs de lunes a viernes (UNICAMENTE)','\n0️⃣ Volver al inicio'],  
        { capture: true},    
        async (ctx, { flowDynamic, endFlow, fallBack, gotoFlow }) => {
            if (ctx.body == '0')
            {               
                return  gotoFlow(flowPrincipal)  
            }
            else
            {
                return fallBack('No es una opción válida')
            }        
        }
    )

const flowRepresentante = addKeyword('4')        
.addAnswer(
    ['Mandar mensajes unicamente al *+5493755538935* ,\nen el horario de 10 a 18hs de lunes a viernes (UNICAMENTE)','\n0️⃣ Volver al inicio'],  
        { capture: true},    
        async (ctx, { flowDynamic, endFlow, fallBack, gotoFlow}) => {
            if (ctx.body == '0')
            {               
                return  gotoFlow(flowPrincipal)  
            }
            else
            {
                return fallBack(`Seleccionar lo sugerido`)
            }        
        }
    )

    let lat;
    let lon;

const flowUbicacion = addKeyword('8')        
.addAnswer(
    ['Mandame tu ubicacion actual','\n0️⃣ Volver al inicio'],  
        { capture: true},    
        async (ctx, { flowDynamic, endFlow, fallBack }) => {
            if (ctx.body == '0')
            {
                return  endFlow()  
            }
            lat = ctx.message.locationMessage.degreesLatitude
            lon = ctx.message.locationMessage.degreesLongitude
            console.log(lat,lon)
        }
    )

var apellidoynombre;
var correo;
var celular;
var tiene = 0;
var dFechaSolicitud;
var vendedor;
var localidad;

 

const flowDemo = addKeyword(['3']) 
.addAnswer(
    ['Necesito saber *¿Como te enteraste de este servicio?*' ,
     ' 1️⃣Instagram \n 2️⃣ Facebook \n 3️⃣ Whatshap  \n 4️⃣ Radio \n 5️⃣ Televisión \n 6️⃣ Folletos \n 7️⃣ VENDEDORES', '\n 0️⃣ Volver al inicio'],
    { capture: true},
    async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
        if (ctx.body == '0'){
            return gotoFlow(flowPrincipal)                
        }
            if (ctx.body == '1'){
                vendedor = "Instagram"                      
            }
            if (ctx.body == '2'){
                vendedor = "Facebook"                      
            }
            if (ctx.body == '3'){
                vendedor = "Whatshap"                      
            }
            if (ctx.body == '4'){
                vendedor = "Radio"                      
            }
            if (ctx.body == '5'){
                vendedor = "Televisión"                      
            }
            if (ctx.body == '6'){
                vendedor = "Folletos"                      
            }
            if (ctx.body == '7'){
                vendedor = "VENDEDORES"                      
            }
        }
    )
.addAnswer(
    ['Ingresa tu localidad...' ,'*Ejemplo:* Misiones, El Soberbio', '\n0️⃣ Volver al inicio'],
    { capture: true},
    async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
        if (ctx.body == '0'){
            return gotoFlow(flowPrincipal)                
        }
            localidad = ctx.body
            return flowDynamic(`Validando  *${localidad}*, continuamos...`)                 
        }
    )
.addAnswer(
    ['Para suscribirte necesito unos datos...' ,'Escribe tu *Nombre y Apellido*', '\n0️⃣ Volver al inicio'],
    { capture: true},
    async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
        if (ctx.body == '0'){
            return gotoFlow(flowPrincipal)                
        }
            apellidoynombre = ctx.body
            return flowDynamic(`Encantado *${apellidoynombre}*, continuamos...`)                 
        }
        )
    
.addAnswer(
    ['Ahora ingresar el correo', '\n0️⃣ Volver al inicio'],
    { capture: true },
    async (ctx, { flowDynamic, endFlow, fallBack, gotoFlow }) => {

        if (!ctx.body.includes('@') &&  ctx.body !=  '0'){
            return fallBack('Veo que no es un correo electrónico \nIntenta otra vez (ingresar un correo)')
        }           

        if (ctx.body == '0'){
            return gotoFlow(flowPrincipal)         
        }
    //})
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
                console.log(row.Vendedor);
                console.log(row.Localidad);
                
                dFechaSolicitud = row.FechaSolicitud;             
                tiene = 1;
            }
        };
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
    //var today = new Date(); 
   // var today = new Date().toJSON().slice(0,24).split('-').reverse().join('/')
   var today = new Date().toLocaleString('en-GB',{hour12: false});
   console.log(today)

   today=today.replace(',',' ') 
   console.log(today)
   
    // obtener la fecha y la hora
    //var now = today.toLocaleString();
    
console.log('--------->'+vendedor)

    let rows = [
        {
            Telefono: `${celular}`,
            Correo: `${correo}` ,
            NombreApellido: `${apellidoynombre}`,    
            CorreoDemo: '',
            FechaSolicitud: today,
            FechaFinal: '',
            FechaPackHBO: '',
            FechaPackFUTBOL: '',
            Vendedor:`${vendedor}`,
            Localidad:`${localidad}`
        }
];

await getRow(celular);


console.log(tiene+'===================================');
console.log(celular+'===================================');
console.log(dFechaSolicitud+'===================================')
    if ( tiene == 0 )
        {
        addRow(rows);
        await flowDynamic(`Te dejo el resumen de tu formulario
            \n- Desde el celular : *${celular}*
            \n- Nombre/apellido: *${apellidoynombre}*
            \n- Correo: *${correo}*            
            \nSe te estará enviando a tu correo en las próximas horas, las credenciales para acceder por 24 Hs.
            \n*QUE LO DISFRUTES*`)
            await delay(5000);
            return gotoFlow(flowPrincipal)   
        }
    else
        {
            await   flowDynamic(`Ya habías solicitado 
            \n- el dia: *${dFechaSolicitud}*
            \ndesde este celular no puedo otorgarte otra, lo siento            
            \nVuelvo al inicio`)          
            await delay(5000);
            return gotoFlow(flowPrincipal)   
        }   
    }    
)
 

const flowWifiTvQueEs = addKeyword('1')    
    .addAnswer(['*Detalle general del servicio*',    
                ' ⭐Es TV DIGITAL + *110 CANALES* en HD',
                ' ⭐Lo ves en el celular y en 3 dispositivos más',
                ' ⭐Pagas anticipado el costo es de 3.300 $',
                ' ⭐Podes contratar packs Futbol $ 1.900 / HBO $ 650 por mes y lo desactivas cuando quieras',  
                ' ⭐Lo podes usar fuera del país',  
                ' ⭐Esta plataforma es homologada y certificada por Google, Samsung, Amazone y LG',  
                ' ⭐Funciona con Android TV , TV BOX, STICK ',  
                '   si no lo tenes te proveemos un dispositivo que conectas a la tele o te conseguís un Chromecast',  
                ' ⭐Usas cualquier conexión de internet'])
    .addAnswer(
        ['0️⃣ Volver al inicio'],
        { capture: true},    
        async (ctx, { flowDynamic, endFlow, fallBack, gotoFlow }) => {
            if (ctx.body === '0')
            {
                return  gotoFlow(flowPrincipal)  
            }
           
                console.log(ctx.body )
                return fallBack('Seleccionar lo sugerido')
                   
        }
    )

const flowPrincipal = addKeyword(['0','hola', 'buenas', 'volver','inicio','menu'])
    .addAnswer('🙌 Hola bienvenido a  *Wifi Tv Bot*')    
    .addAnswer(['Elegí una de las siguientes opciones para que podamos ayudarte'] )
    .addAnswer(['*NOTA:* Solo ingresa números.',
            '1️⃣ ¿Que es Wifi TV? ',                         
            '2️⃣ Como suscribirme',         
            '3️⃣ Solicitar DEMO',        
            '4️⃣ Hablar con un representante',                     
            '5️⃣ Contratar paquetes',
            '6️⃣ Consultar mi saldo ',  
            '7️⃣ Pagar con Mercado Pago',
          //'#️⃣ Mandame tu hubicación'
        ],
        null,
        null,
        [   flowWifiTvQueEs,
            flowDemo,
            flowSuscripcion,
            flowPaquetes,
            flowFacturacion,
            flowSaldo,
            flowMercadoPago,
            flowFutbol,
            flowHBO,
            flowUbicacion,
            flowRepresentante]
    
 )

//------------------------------


const main = async () => {
    const adapterDB = new MockAdapter()   

 
const adapterFlow = createFlow([flowInicial,
                               flowPrincipal])
                                    
    const adapterProvider = createProvider(BaileysProvider)
    
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
     
    QRPortalWeb() 
}
main()
