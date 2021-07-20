import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// many to many
// user <-> posts
// severals users can upvote same post or many posts
// user -> join table <- posts 
// user -> updoot <- posts 

@ObjectType()
@Entity()
export class Updoot extends BaseEntity { // BaseEntity provides methods to work with the entity
    // @Field()
    @Column({ type: "int" })
    value: number;

    // @Field()
    @PrimaryColumn()
    userId: number;

    // @Field(() => User)
    @ManyToOne(() => User, user => user.updoots) // 
    user: User;

    // @Field()
    @PrimaryColumn()
    postId: number;
 
    // @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.updoots, {
        onDelete: 'CASCADE'
    }) 
    post: Post;
}