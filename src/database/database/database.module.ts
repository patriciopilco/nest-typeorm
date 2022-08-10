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
