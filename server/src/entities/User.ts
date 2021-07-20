import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";


@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => Int)              // if commented, field will no longer be available to the client  
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;
    
    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Post, post => post.creator)
    posts: Post[];
    
    @OneToMany(() => Updoot, updoot => updoot.user)
    updoots: Updoot[];

    @Field()
    @Column({ unique: true })
    username!: string;
 
    @Field()
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;
}