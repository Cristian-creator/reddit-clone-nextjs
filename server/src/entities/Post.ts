import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field(() => Int)        // if commented, field will no longer be available to the client  
    @PrimaryKey()
    id!: number;
    
    @Field(() => String)
    @Property({ type: 'date' })
    createdAt = new Date();
    
    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();
    
    @Field()
    @Property({ type: 'text'})
    title!: string;
}