import logger from "#config/logger.js";
import { getAllusers, getUserById, updateUser, deleteUser } from "#services/users.services.js";

export const fetchAllUsers = async (req, res, next) => {
    try {
        logger.info('Getting users...');
        const allUsers = await getAllusers();
        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: allUsers,
        });
    } catch (error) {
        logger.error('Error fetching users', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message,
        });
    }
};

export const fetchUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        logger.info(`Getting user with id: ${userId}`);
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        });
    } catch (error) {
        logger.error('Error fetching user by id', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message,
        });
    }
};

export const updateUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        const { name, email, role } = req.body;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        logger.info(`Updating user with id: ${userId}`);
        const updatedUser = await updateUser(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        logger.error('Error updating user', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message,
        });
    }
};

export const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        logger.info(`Deleting user with id: ${userId}`);
        const deletedUser = await deleteUser(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: deletedUser,
        });
    } catch (error) {
        logger.error('Error deleting user', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message,
        });
    }
};