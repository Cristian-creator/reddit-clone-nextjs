 import { Field, InputType } from "type-graphql";
 
 // using this instead of multiple Args
@InputType()
export class UsernamePasswordInput {
    @Field()
    email: string;

    @Field()
    username: string;

    @Field()
    password: string;
}
