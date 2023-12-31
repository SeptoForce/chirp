import { type User } from "@clerk/nextjs/dist/types/server";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
    dateJoined: user.createdAt,
  };
};

export default filterUserForClient;
