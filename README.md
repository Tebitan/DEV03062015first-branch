<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Ejecutar en desarrollo

1. Clonar el repositorio
2. Ejecutar

```
$ npm install
```

3. Tener Nest CLI Instalado

```
$ npm install -g @nestjs/cli
```
4. Clonar el archivo **.env.template** y renombrar la copia **.env**

5. Ajustar las variables de entorno definidas en `.env`

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stack usado
- fastify
- Nest
- Mongoose
- Undici(Http)