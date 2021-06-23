import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
// import { Options } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";

// The point of creating a separate config file is to acces infos specified in export default

// ------- SECOND WAY  ------ 
export default {
    migrations: {
        path: path.join(__dirname, './migrations'), // absolute path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/,    // regex pattern for the migration files (ts or js)
    },
    entities: [Post, User],
    dbName: 'reddit',
    user: 'cristian',
    password: 'sefusuprem',
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];

// ------- FIRST WAY  ------ 
// const microConfig: Options = {
//     entities: [Post],
//     dbName: 'reddit',
//     type: 'postgresql',
//     debug: !__prod__,
// }; 

// export default microConfig;