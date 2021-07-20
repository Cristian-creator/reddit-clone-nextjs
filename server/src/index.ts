require('dotenv').config();

import { ApolloServer } from 'apollo-server-express';   // CTRL + SPACE for autocomplete
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

//     Redis & sessions
import 'reflect-metadata';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';

// typeorm 
import { createConnection } from 'typeorm';
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from 'path';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

const main = async () => {
    // -----  create connection pool -----
    const conn = await createConnection({
        type: process.env.DB_TYPE as any,
        database: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASS, 
        logging: true,
        synchronize: true,      // create tables automatically without run migration
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot]
    });

    // -----  run migrations  -----
    // await conn.runMigrations();

    // -----  clear posts db  -----
    // await Post.delete({});

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    const corsOptions = {
        credentials: true,
        origin: "http://localhost:3000",
    };

    app.use(cors(corsOptions));

    app.use(
        session({
            name: COOKIE_NAME,                              // random name
            store: new RedisStore({ 
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax',                      // csrf 
                secure: __prod__                      // cookie only works in https
            }, 
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET as string,                
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({                //  await because it returns a promise
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ req, res, redis, userLoader: createUserLoader(), updootLoader: createUpdootLoader() })            // return object for context        
    });

    apolloServer.applyMiddleware({ app, cors: false });

    try {
        app.listen(4000, () => {
            console.log("server started on localhost:4000");
        });
    } catch (error) {
        console.log("error");
    }
};

main().catch((err) => {
    console.log(err);
});