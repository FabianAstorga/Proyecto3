# Proyecto 3 - Departamento de Mecanica
Una aplicación web desarrollada para ...
=======
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
</p>

## 🛠️ Tecnologías utilizadas

### Frontend:
- **Angular (v18)**
- **Tailwind CSS** (para el diseño)
- **RxJS** (para manejo de estado reactivo)
- **JWT** (para autenticación)
- **WebSocket** (para notificaciones en tiempo real)
- **Swagger** (para documentación del API)

### Backend:
- **NestJS** (v11)
- **TypeORM**
- **MySQL**
- **JWT** (para autenticación)
- **Passport**
- **WebSocket** (para notificaciones en tiempo real)
- **Swagger** (documentación de API)

## Archivo .env (backend)

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=panel
DB_PASSWORD=
DB_NAME=paneladmin
JWT_SECRET=mi_secreto_super_seguro
```

## Instalación

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

```bash
git clone https://github.com/Cristian-HC/dhl-frontend.git](https://github.com/FabianAstorga/Proyecto3.git
Carpeta -> Backend y Frontend
cd Proyecto3/Carpeta
```

```bash
$ npm install
```

## Compilación y ejecución del proyecto

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Generar Migraciones

```bash
# build migration (example)
npx typeorm-ts-node-commonjs migration:generate ./src/database/migrations/initial -d ./src/database/data-source.ts

# execute migration (example)
npx typeorm-ts-node-commonjs migration:run -d ./src/database/data-source.ts
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

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

