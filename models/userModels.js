const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter a valid email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    role:{
        type: String,
        enum: ['admin', 'user' , 'guide' , 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please enter your password confirmation'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password does not match',
        },
        select: false, // Prevents the field from being included in queries
    },
    photo: {
        type: String,
        // required: [true, 'Please enter a valid photo'],
    },
    passwordChangeAt:Date,
    passwordResetToken:String,
    passwordResetExpire:Date,
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined; // Remove passwordConfirm field before saving

        next();
    } catch (err) {
        next(err); // If bcrypt fails, pass the error to the next middleware
    }
});

// checking password
userSchema.methods.checkPassword = async  function (userPassword , databasePassword) {

       return   await bcrypt.compare(userPassword , databasePassword);


}

// Set passwordChangedAt before saving the user:
userSchema.pre('save' ,  function (next) {
     if(!this.isModified('password') || this.isNew) return next()

    // Subtract 1s to avoid token being created before this field is set
    this.passwordChangeAt = Date.now() - 1000;

     next()
})


// Add a method to check if password was changed after token was issued:
userSchema.methods.passwordChangeAfter = function (JWTTimeStamp) {
     if(this.passwordChangeAt){
          const changeTimeStamp  = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
          return JWTTimeStamp < changeTimeStamp;
     }

     // false means no change
    return  false;
}

// create reset password token

userSchema.methods.createPasswordResetToken = function () {

      const resetToken = crypto.randomBytes(32).toString('hex');

      this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      console.log(resetToken , this.passwordResetToken);

      this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
