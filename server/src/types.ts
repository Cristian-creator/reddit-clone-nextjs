import { Request, Response } from 'express';
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

export type MyContext = {
    // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } } ,
    redis: Redis,
    res: Response,
    userLoader: ReturnType<typeof createUserLoader>,
    updootLoader: ReturnType<typeof createUpdootLoader>,
}

// export interface DatabaseConfig = {
//     type: ,
//     database: process.env.DB_NAME,
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASS, 
    
// }