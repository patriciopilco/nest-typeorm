import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Client } from 'pg';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { userInfo } from 'os';

@Global() 
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ config.KEY ],
            useFactory:(ConfigService: ConfigType<typeof config>) => {
                const { user, host, dbName, password, port } = ConfigService.postgres;
                return {
                    type: 'postgres',
                    host,
                    port,
                    userName: user,
                    password,
                    database: dbName,
                };
            },
        }),
    ],
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
    exports: ['PG', TypeOrmModule]
})
export class DatabaseModule {}
