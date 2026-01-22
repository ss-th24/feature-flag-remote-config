const zod = require('zod');


const employeeSchema = zod.object({
    name : zod.string().nonempty(),
    phone : zod.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid phone number'),
    gender: zod.enum(['M', 'F', 'O'])
});

const employeeIdSchema = zod.object({
    id : zod.uuid()
});

module.exports = {employeeIdSchema, employeeSchema};