import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        // validate: { 
        //     validator: function (v) {
        //         return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(v);
        //     },
        //     message: props => `Password must be at least 6 characters long and contain at least one letter and one number.`
        // }
    },

    phone:{
        type: String,
        required: true,
        trim: true,
    },

    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
        
    },

    isActive: {
        type: Boolean,
        default: true
    },  
    

},
{timestamps: true}
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);

export default User;