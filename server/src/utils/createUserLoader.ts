import DataLoader from 'dataloader';
import { User } from '../entities/User';

// userIds: [1, 4, 2, 3, 5]
// users: [{ id: 1, username: "bob" }, { id: 2, username: "tom" }, ...]
// userIdToUser: {}
// users.map -> userIdToUser[1] = { id: 1, username: "bob" }
// users.map -> userIdToUser[4] = { id: 4, username: "john" }
// sortedUsers = userIds.map((id: 1) =>  userIdToUser[id: 1])
// return [1, 2, 3, 4, 5].map -> [{ id: 1, username: "bob" }, { id: 2, username: "tom" }, ...]

export const createUserLoader = () => new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach(u => {
        userIdToUser[u.id] = u;
    });

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    // console.log('sorted users: ', sortedUsers);
    return sortedUsers;
});