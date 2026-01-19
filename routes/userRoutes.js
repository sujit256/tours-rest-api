
const express = require("express");
const userController = require("./../controllers/userController");

const router = express.Router();

//user route handler

// app.use('/api/v1/users' , userRouter);
//user route

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

 module.exports = router; 
