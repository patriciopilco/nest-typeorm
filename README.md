<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Configuración Base Datos Postgres 

1. Crear el archivo [ docker-compose.yml ] sobre el root del proyecto.

```bash
version: '3.4'


services:
#Crear servicio postgres
  postgres:
    image: postgres:13
    environment:
     - POSTGRES_DB=my_db
     - POSTGRES_USER=root
     - POSTGRES_PASSWORD=123456
    ports:
      - '5432:5432'
    volumes:
#Crear volumen postgres_data    
      - ./postgres_data:/var/lib/postgresql/postgres_data

```      
2. Ignorar el directorio postgres_data en [ .gitignore ]

```bash
# Igonar directorio postgres_data
/postgres_data

```

3. Ejecutar comandos docker de acuerdo a la necesidad

- *(Subir servicio)*      docker compose up -d postgres
- *(Verificar servicio)*  docker compose ps
- *(Bajar servicio)*      docker compose down


# Conexión Inyectable y configuracón de ambientes

1. Crear un modulo database

```bash
nest g module database/database 
```

2. Definir modulo como global, para que sea visto por cualquier otro servicio.

```bash
import { Module, Global } from '@nestjs/common';

@Global() 
@Module({})
export class DatabaseModule {}

```

3. Crear ambientes [ .env, .stag.env, pro.env]

```bash
POSTGRES_DB=my_db
POSTGRES_USER=root
POSTGRES_PASSWORD=123456
POSTGRES_PORT=5432
POSTGRES_HOST=localhost

```

4. Crear archivo config.ts

```bash
import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        postgres:{
            dbName: process.env.POSTGRES_DB,
            port: parseInt(process.env.POSTGRES_PORT),
            password: process.env.POSTGRES_PASSWORD,
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
        }
    }
}
);
```

5.Configurar modulo database

```bash

import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Client } from 'pg';
import config from 'config';

@Global() 
@Module({
    providers: [
        {
            provide: 'PG',
            useFactory: (ConfigService: ConfigType<typeof config>)=>{
                const { user, host, dbName, password, port} = ConfigService.postgres;
                const client = new Client ({
                    user,
                    host,
                    database: dbName,
                    password,
                    port,
                });
            client.connect();
            return client;    
            },
            inject: [config.KEY]
        }
    ],
    exports: ['PG']
})
export class DatabaseModule {}

```

6. Inyectar en un servicio

```bash

import {Client} form 'pg';

constructor(
  @Inject('PG') private clientPg: Client,
){}

metodo () {
  return new Promise((resolve,reject)=>{
    this.clienPg.query('SELECT * FROM tasks',(err,rest)=>{
      if(err){
        reject(err);
      }
      resolve(res.rows);
    });
  });
}
```


