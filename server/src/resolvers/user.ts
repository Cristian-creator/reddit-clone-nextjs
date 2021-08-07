import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

// return errors if there are errors, otherwise return user
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver(User)
export class UserResolver {
    
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() {req}: MyContext) {
        // this is the current user and it s ok to show them their own email
        if(req.session.userId === user.id) {
            return user.email;
        }

        // current user wants to see someone else email
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserResponse> {
        if(newPassword.length <= 2) {
            return { errors: [
                {
                    field: "newPassword",
                    message: "length must be greater than 2"
                },
            ]} 
        }
            const key = FORGET_PASSWORD_PREFIX + token;
            const userId = await redis.get(key) ;

            if(!userId) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "token expired",
                        },
                    ] 
                }
            }

            const userIdNum = parseInt(userId);
            const user = await User.findOne(userIdNum);

            if(!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "user no longer exists",
                        },
                    ] 
                }
            };

            await User.update({id: userIdNum }, {
                password: await argon2.hash(newPassword)
            });

            redis.del(key);

            // log in user after change password
            req.session.userId = user.id;
            
            return { user }; 
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() {redis}: MyContext
    ) { 
        const user = await User.findOne({where: { email }});
        if(!user) {
            // the email is not in the db
            return true;
        }

        const token =  v4(); // random 

        await redis.set(
            FORGET_PASSWORD_PREFIX + token, 
            user.id, 
            'ex',               // expire mode
            1000 * 60 * 60 * 3
        ); // 3 days

        await sendEmail(email, `
            <a href="http://localhost:3000/change-password/${token}">reset password</a>
        `);

        return true;
    }

    @Query(() => User, { nullable: true })
    async me (
        @Ctx() { req  }: MyContext
    ) {
        // you are not logged in
        if(!req.session.userId) return null;
        
        return User.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
       const errors = validateRegister(options);
       if(errors) {
           return { errors };
       }

        const hashedPassword = await argon2.hash(options.password);
        //  ----   used knex instead of this   ---
        // const user = em.create(User, {
        //     username: options.username, 
        //     password: hashedPassword
        // });
        // ----------------------------------------
        let user;
        try {
            // -----  this  --------
            // User.create({}).save();
            // ------  using query builder
            const result = await getConnection().createQueryBuilder().insert().into(User).values({
                username: options.username,
                email: options.email, 
                password: hashedPassword,
            })
            .returning('*')
            .execute();
            console.log('result: ', result);
            user = result.raw[0];
            // -----------   Knex Query Builder   -----------
            // const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
            //     username: options.username,
            //     email: options.email, 
            //     password: hashedPassword,
            //     created_at: new Date(),
            //     updated_at: new Date(),
            // }).returning("*"); // return all the fields
            // // await em.persistAndFlush(user);
            // user = result[0];
            // ----------------------------
        } catch (error) {
            // duplicate username error
            if(error.code === '23505' || error.detail.includes("already exists")) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken"
                        }
                    ]
                }
            }
        }

        req.session.userId = user.id;      

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        // -------------------------------------------------
        // Within graphql playgxround -> Settings - dont forget 
        // to set request.credentials to "include" in order to make cookies work
        // -------------- -----------------------------------
        
        const user = await User.findOne(usernameOrEmail.includes("@") ?  
            { where : { email: usernameOrEmail } }  
            :
            { where : { username: usernameOrEmail } }
        );

        if(!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: 'that username doesnt exist'
                    }
                ],
            }
        }
        const valid = await argon2.verify(user.password, password);
        if(!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'incorrect password'
                    } 
                ],
            }
        }   

        req.session.userId = user.id;      

        return {
            user
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            // clear cookie even if session isnt destroyed
            res.clearCookie(COOKIE_NAME);
                
            if(err) {
                console.log(err);
                resolve(false);
                return;
            }
            
            resolve(true);
        }));
    }
}

//  --------------------        INITIAL   FORM         --------------------
// @Mutation(() => UserResponse)
//     async login(
//         @Arg('usernameOrEmail', () => UsernamePasswordInput) options: UsernamePasswordInput,
//         @Ctx() {em, req}: MyContext
//     ): Promise<UserResponse> {
//         // -------------------------------------------------
//         // Within graphql playground -> Settings - dont forget 
//         // to set request.credentials to "include" in order to make cookies work
//         // -------------------------------------------------
        
//         const user = await em.findOne(User, { username: options.username });
//         if(!user) {
//             return {
//                 errors: [
//                     {
//                         field: 'username',
//                         message: 'that username doesnt exist'
//                     }
//                 ],
//             }
//         }
//         const valid = await argon2.verify(user.password, options.password);
//         if(!valid) {
//             return {
//                 errors: [
//                     {
//                         field: 'password',
//                         message: 'incorrect password'
//                     } 
//                 ],
//             }
//         }

//         req.session.userId = user.id;      

//         return {
//             user
//         }
//     }