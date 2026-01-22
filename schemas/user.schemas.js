const zod = require('zod');

const userSignSchema = zod.object({
    username : zod.string().nonempty().min(6),
    password : zod.string().nonempty().min(6),
    role : zod.enum(['superadmin', 'admin', 'guest', 'viewer', 'contributor'])
});

const userSchema = zod.object({
    username : zod.string().nonempty().min(6),
    password : zod.string().nonempty().min(6)
});

module.exports = {userSignUpSchema : userSignSchema, userLogInSchema: userSchema};