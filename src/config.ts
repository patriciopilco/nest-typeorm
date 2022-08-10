import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
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