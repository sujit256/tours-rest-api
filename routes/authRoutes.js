const express = require("express");
const router = express.Router();

const authController = require('./../controllers/authControllers')

router.post('/signUp' , authController.signUp);
router.post('/logIn' , authController.logIn)

router.patch('/forgotPassword' , authController.forgotPassword)
router.patch('/resetPassword/:token' , authController.resetPassword)



module.exports = router;