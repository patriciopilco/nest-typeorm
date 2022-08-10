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

3. Crear achivos de variables de entorno
    - .env
    - .stag.env
    - .pro.env
    - src/enviroments.ts

```bash
# Contenido de variables de entorno 
POSTGRES_DB=my_db
POSTGRES_USER=root
POSTGRES_PASSWORD=123456
POSTGRES_PORT=5432
POSTGRES_HOST=localhost
```

```bash
# Contenido de enviroments.ts 
export const enviroments = {
    dev: '.env',
    stag: '.stag.env',
    prod: '.prod.env',
  };
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






5.Configurar modulo *database.module.ts*

```bash

import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Client } from 'pg';
import database from 'config';

@Global() 
@Module({
    providers: [
        {
            provide: 'PG',
            useFactory: (ConfigService: ConfigType<typeof database>)=>{
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
            inject: [database.KEY]
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

# ORM [ TypeORM ]

- Contiene metodos complejos
- Abstracción de código complejo SQL
- Abstrae la conexión

## TypeORM en NestJS

1. instalar la dependencia de typeorm

```bash
npm install --save @nestjs/typeorm typeorm
```
2. Configurar modulo database 

- importar el modulo typeorm

```bash
import { TypeOrmModule } from '@nestjs/typeorm'
```

- Realizar la configuración asincrona a base de datos usando *TypeOrmModule*

 * Añadir atributo synchronize (Solo desarrollo)
 * Añadir atributo autoLoadEntities (Solo desarrollo)
 * exportar TypeOrmModule


```bash
import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import postgres from 'src/config';

@Global() 
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ postgres.KEY ],
            useFactory: (configService: ConfigType<typeof postgres>) => {
                const { user, host, dbName, password, port } = configService.postgres;
                console.log(configService.postgres);
                return {
                    type: 'postgres',
                    host,
                    port,
                    username: user,
                    password,
                    database: dbName,
                    synchronize: true, //       nuevo atributo
                    autoLoadEntities: true, //  nuevo atributo
                };
            },
        }),
    ],
    
    exports: [TypeOrmModule]
})
export class DatabaseModule {}
```





## TypeORM Entidades

1. Crear el modulo de productos

```batch
nest g module products
```

2. Crear directorio entities
3. Crear Clase producto.entity.ts

```bash
import { PrimaryGeneratedColumn, Column, Entity} from 'typeorm';


@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true})
    name: string;

    @Column({ type: 'text'})
    description: string;

    @Column({ type: 'int'})
    price: number;

    @Column({ type: 'int'})
    stock: number;

    @Column({ type: 'varchar'})
    image: string;
}
```
3. Modificar el modulo products, para administrar las entidades

```bash
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './../products/entities/product.entity';

@Module({
    imports: [ TypeOrmModule.forFeature([Product])],
})
export class ProductsModule {}
```
## Patron Repositories en Servicios

1. Crear el servicio de productos

```bash

nest g s products/services/products --flat
```
2. Configurar servicio
-Importar InjectRepository
-Importar entidad Product
-Importar Repository para tipar la entidad en el constructor.
-Crear constructor e inyectar product

```bash
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from './../entities/product.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product) private productRepo:Repository<Product>,
    ){}
}

```

3 Definir metodos de servicio

```bash


    findAll(){
        return this.productRepo.find();
    }

    findOne(id:number){
        const product = this.productRepo.findOneBy({id: id })
        if(!product){
            throw new NotFoundException(`Producto #${id} not found`);
        }
        return product;
    }
```

## Crear Controlador

1. Crear controlador

```bash
nest g co products/controllers/products --flat
```
2. Crear métodos controlador

```bash

import { Controller, Get } from '@nestjs/common';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
   
    constructor(
        private productsService: ProductsService
    ){}
    
    @Get()
    getProducts(){
        return this.productsService.findAll();
    }
}

```

## Ejecutar

```bash


```
