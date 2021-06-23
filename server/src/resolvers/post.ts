import { Post } from '../entities/Post';
import { Ctx, Query, Resolver, Arg, Int, Mutation } from "type-graphql";
import { MyContext } from 'src/types';

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts( @Ctx() { em }: MyContext ): Promise<Post[]> { // { em } -- i used destructuring, can use ctx instead
        return em.find(Post, {});
    }

    @Query(() => Post, {nullable: true})
    post( 
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext 
        ): Promise<Post | null> {                         // { em } -- i used destructuring, can use ctx instead
        return em.findOne(Post, { id });
    }

    // dont forget to specify mutation {  } within playground 
    @Mutation(() => Post)
    async createPost( 
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
        ): Promise<Post> {                         // { em } -- i used destructuring, can use ctx instead
            const post = em.create(Post, { title });
            await em.persistAndFlush(post);
        
            return post;
    }

    // dont forget to specify mutation {  } within playground 
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        @Ctx() { em }: MyContext 
        ): Promise<Post | null> {                         // { em } -- i used destructuring, can use ctx instead
            const post = await em.findOne(Post, { id });
            if(!post) {
                return null;
            }
            if(typeof title !== 'undefined') {
                post.title = title;
                await em.persistAndFlush(post);
            }
            return post;
    }

     // dont forget to specify mutation {  } within playground 
     @Mutation(() => Boolean)
     async deletePost(
         @Arg('id') id: number,
         @Ctx() { em }: MyContext 
         ): Promise<boolean> {                         // { em } -- i used destructuring, can use ctx instead
            try {
                await em.nativeDelete(Post, { id });
            } catch (error) {
                return false;
            }
            return true;
     }
}