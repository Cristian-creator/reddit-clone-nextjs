import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";  // CTRL + SPACE for autocomplete
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
//     Redis & sessions
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';

const main = async () => {
    const orm = await MikroORM.init(microConfig);   // connect to DB
    orm.getMigrator().up();                         // run migrations

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    const corsOptions = {
        credentials: true,
        origin: "http://localhost:3000",
    };

    app.use(cors(corsOptions));

    app.use(
        session({
            name: 'qid',                              // random name
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax',                      // csrf 
                secure: __prod__                      // cookie only works in https
            },
            saveUninitialized: false,
            secret: 'lsdaksdjasdp1p23',                // MOVE TO ENV
            resave: false,
        })
    );
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({                // await because it returns a promise
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })            // return object for context        
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log("server started on localhost:4000");
    });

    //  ----------    ADD  POST  -------------
    // const post = orm.em.create(Post, { title: 'my first post' });
    // // const post = new Post('my first post');  equivalent to the above line
    // await orm.em.persistAndFlush(post);
    
    // -----------   FIND POSTS  ------------
    // const posts = await orm.em.find(Post, {});
    // console.log(posts);

};

main().catch((err) => {
    console.log(err);
})

// MikroORM is for how we are going to interact with the database, create tables
//, select data, basically all database needs 