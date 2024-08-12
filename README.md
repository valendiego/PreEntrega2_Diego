# Proyecto Coderhouse Backend

Este proyecto fue creado con finalidades educativas para el curso de Programación Backend de Coderhouse.

## Correr de manera local
```bash
$ git clone https://github.com/valendiego/backend_Diego.git
$ cd backend_Diego
$ npm install
$ cd src
$ nodemon app
```
Para finalizar la instalación, deberá crear un archivo `.env` y agregar las respectivas variables de entorno. Puedes ver un ejemplo [aquí.](https://github.com/valendiego/backend_Diego/blob/main/src/.env.example).

## Documentación

Para revisar la documentación de los **endpoints**, lo puedes hacer desde [aquí](http://localhost:8080/apidocs/).

## Testing

Para poder correr los tests de la aplicación, deberás haber levantado el servidor en primer lugar. Una vez hecho esto, deberás abrir una nueva consola y ejecutar:

````bash
npm test
````

## Deploy

Se realizó el deploy de la aplicación en la plataforma Railway. Puedes acceder al mismo ingresando [aquí](https://techstore-backend.up.railway.app/users)

## Construido usando

#### Dependencias

- [@faker-js/faker](https://fakerjs.dev/guide/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Connect-mongo](https://www.npmjs.com/package/connect-mongo)
- [Cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Express](https://www.npmjs.com/package/express)
- [Express-handlebars](https://handlebarsjs.com/guide/#what-is-handlebars)
- [Express-session](https://www.npmjs.com/package/express-session)
- [Helmet](https://www.npmjs.com/package/helmet)
- [Jsonwebtoken](https://jwt.io/)
- [Mongoose](https://mongoosejs.com/docs/guide.html)
- [Mongoose-paginate-v2](https://www.npmjs.com/package/mongoose-paginate-v2)
- [Multer](https://www.npmjs.com/package/multer)
- [Nodemailer](https://nodemailer.com/about/)
- [Passport](https://www.passportjs.org/docs/)
- [Passport-github2](https://www.passportjs.org/packages/passport-github2/)
- [Passport-jwt](https://www.passportjs.org/packages/passport-jwt/)
- [Passport-local](https://www.passportjs.org/packages/passport-local/)
- [Socket.io](https://socket.io/docs/v4/)
- [Swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)
- [Swagger-ui-express](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/)
- [Winston](https://www.npmjs.com/package/winston)

#### Dependencias de Desarrollo
- [Chai](https://www.chaijs.com/)
- [Mocha](https://mochajs.org/)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Supertest-session](https://www.npmjs.com/package/supertest-session)
