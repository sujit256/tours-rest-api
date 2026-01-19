const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const jwt =  require('jsonwebtoken');
const appError = require('./../utils/appError')
const {promisify} = require('util');
const sendMail = require('./../utils/email')
const crypto = require('crypto');


const signToken  = function(id) {

  return   jwt.sign({id} , process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})

}


exports.signUp = catchAsync(async (req , res , next) => {

       const { name , email , password , passwordConfirm , role } = req.body;


       const user = await User.create({
            name,
           email,
           password,
           role,
           passwordConfirm,
       });

       const token =  signToken(user._id);
       // console.log(token);

       res.status(201).json({
            status: 'success',
            data:{
                user,
                token,
            }
       })
})


exports.logIn = catchAsync(async (req , res , next) => {
    const { email, password } = req.body;
    // check if email and password exists
    if (!email || !password) {
          return next(new appError('Email or password is required' , 401));
    }
    // check if user  of this email and password exists in database
    const user  =  await User.findOne({email}).select('+password')
    const checkPassword = await user.checkPassword(password , user.password);

    if(!user || !checkPassword ) {
        return next(new appError('Pasword does not match' , 401));
    }

    // if everything is ok
    const token =  signToken(user._id);
      if(!token){
           return next(new appError('There is no token' , 400));
      }

      res.status(200).json({
          status: 'success',
          data:{
              token,
          }
      })

})

exports.protect = catchAsync(async (req , res , next) => {

      // getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
          token  = req.headers.authorization.split(' ')[1]

    }
    console.log(token);

    if(!token) {
        return next(new appError('Token is required' , 401));
    }

     // verification token

      const decoded =  await promisify(jwt.verify)(token , process.env.JWT_SECRET)
    console.log(decoded)

    // check if user still exists
    const currentUser = await User.findById(decoded.id)
    if(!currentUser) {
        return next(new appError('There is no user of this is in database' , 401));
    }


    // check if user changed password after the token was issued
    if(currentUser.passwordChangeAfter(decoded.iat)){
        return  next(new appError('password recently change , please log in again' , 401));
    }

    // grant accessed to protected route

    req.user = currentUser; // attach user to req for future use
    next(); // allow to access protected route
})


exports.restrictTo = (...roles) => {
     return (req , res  , next ) => {
          if(!roles.includes(req.user.role)){
               next(new appError('Does not have permission to perfom this action', 401));
          }
     }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new appError('There is no user with this email.', 401));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't request a password reset, please ignore this email.`;

    try {
        await sendMail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message,
        });

        console.log('✅ Reset token sent to:', user.email);

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        console.error('❌ Error sending email:', err);

        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new appError('There was an error sending the email. Try again later!', 500));
    }
});



exports.resetPassword = catchAsync(async (req , res , next) => {

    // get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(hashedToken);

    // find user of having resettoken
    const user =  await User.findOne({
         passwordResetToken: hashedToken,
         passwordResetExpire:{$gt: Date.now()}
    });

    if(!user) {
        return  next(new appError('Token invalid or token expires', 401));
    }

    // Set the New Password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpire = undefined;
    user.passwordResetToken = undefined;
    await user.save()

    // send jwt token
    const token =  signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    })

})