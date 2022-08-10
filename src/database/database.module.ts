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
