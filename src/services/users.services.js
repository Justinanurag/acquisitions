import { db } from "#config/database.js";
import logger from "#config/logger.js";
import User from "#models/user.model.js";
import { eq } from "drizzle-orm";

export const getAllusers = async () => {
    try {
        return await db.select({
            id: User.id,
            email: User.email,
            name: User.name,
            role: User.role,
            created_at: User.created_at,
            updated_at: User.updated_at,
        }).from(User);
    } catch (error) {
        logger.error('error getting users', error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const [user] = await db
            .select({
                id: User.id,
                email: User.email,
                name: User.name,
                role: User.role,
                created_at: User.created_at,
                updated_at: User.updated_at,
            })
            .from(User)
            .where(eq(User.id, id))
            .limit(1);
        return user;
    } catch (error) {
        logger.error('error getting user by id', error);
        throw error;
    }
};

export const updateUser = async (id, updateData) => {
    try {
        const [updatedUser] = await db
            .update(User)
            .set({
                ...updateData,
                updated_at: new Date(),
            })
            .where(eq(User.id, id))
            .returning({
                id: User.id,
                email: User.email,
                name: User.name,
                role: User.role,
                created_at: User.created_at,
                updated_at: User.updated_at,
            });
        return updatedUser;
    } catch (error) {
        logger.error('error updating user', error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const [deletedUser] = await db
            .delete(User)
            .where(eq(User.id, id))
            .returning({
                id: User.id,
                email: User.email,
                name: User.name,
                role: User.role,
            });
        return deletedUser;
    } catch (error) {
        logger.error('error deleting user', error);
        throw error;
    }
};