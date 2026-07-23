import { UserModel, type User } from "../models/User";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}

export async function createUser(data: Pick<User, "email" | "passwordHash" | "role">) {
  return UserModel.create(data);
}
