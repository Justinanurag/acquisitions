import express from 'express';
const router = express.Router();

router.post('/sign-up', (req, res) => {
    res.send('/api/auth/sign-up response');
})

router.post('/sign-in', (req, res) => {
    res.send('/api/auth/sign-in response');
})


router.post('/sign-up', (req, res) => {
    res.send('/api/auth/sign-in response');
})

export default router;