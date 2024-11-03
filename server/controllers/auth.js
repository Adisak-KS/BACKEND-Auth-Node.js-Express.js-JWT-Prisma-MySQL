const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
    try {
        const { email, password } = req.body

        // Step 1 Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email'
            })
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            })
        }

        // Step 2 Check Email Already Exists
        const checkUser = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            })
        }

        // Step 3 Hash Password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        // Step 4 Register
        const userData = {
            email: email,
            password: hashPassword,
        }

        const newUser = await prisma.user.create({
            data: userData,
            select: {
                id: true,
                email: true
            }
        })

        res.json({
            success: true,
            message: 'Register Success',
        })
    } catch (err) {
        console.log(err)
        res.send("Server Error").status(500)
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            })
        }


        // Step 1 Check Email in DB
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })


        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email not found'
            })
        }


        // Step 2 Check Password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Password not match'
            })
        }

        // Step 3 Create payload
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        }

        // Step 4 Create Token
        const token = jwt.sign(payload, "kaiKa", {
            expiresIn: "1d"
        })

        // console.log(token)
        res.json({
            user: payload.user,
            token: token
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }

}