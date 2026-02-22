import { fetchAllUsers, fetchUserById, updateUserById, deleteUserById } from '#controller/users.controller.js';
import express from 'express';

const router = express.Router();

router.get('/allusers', fetchAllUsers);
router.get('/:id', fetchUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
export default router;