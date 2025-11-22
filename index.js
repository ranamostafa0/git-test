const express = require("express")
const path = require("node:path")
const fs = require("fs/promises")
const app = express()
const port = 3000

const filePath = path.join(__dirname, "./users.json")

async function getUsers() {
    try {
        const users = await fs.readFile(filePath, { encoding: "utf8" })
        return JSON.parse(users)
    } catch (error) {
        return []
    }
}

async function saveUsers(arr) {
    await fs.writeFile(filePath, JSON.stringify(arr))
}

app.use(express.json())

app.post("/user", async (req, res, next) => {
    const { name, age, email } = req.body
    console.log({ name, age, email })
    const users = await getUsers()
    console.log({ users })
    const checkUser = users.find((user) => user.email == email)
    if (checkUser) {
        res.status(409).json({ message: "Email already exists" })
    }
    users.push({ id: Date.now().toString(), name, age, email })
    await saveUsers(users)
    res.status(201).json({ message: "User Added Successfully" })
})

app.get("/user/search", async (req, res, next) => {
    const { name } = req.query
    const users = await getUsers()
    const user = users.find((user) => user.name.toLowerCase() == name.toLowerCase())
    if (!user) {
        return res.status(404).json({ message: "User Not found" })
    }
    return res.status(200).json({ user })
})

app.patch("/user/update/:id", async (req, res, next) => {
    const { id } = req.params
    const { name, age, email } = req.body
    if (!name && !age && !email) {
        return res.status(400).json({ message: "fill data neeeded to update" })
    }
    const users = await getUsers()
    const user = users.find((user) => user.id == id)
    if (!user) {
        res.status(404).json({ message: "User Not found" })
    }
    if (email) {
        const emailExists = users.some((user) => user.email == email && user.id != id)
        if (emailExists) {
            res.status(409).json({ message: "Email already Exists" })
        }
        user.email = email
    }
    if (name) user.name = name
    if (age) user.age = age
    await saveUsers(users)
    res.status(200).json({ message: "User Updated Successfully" })
})

app.delete("/user{/:id}", async (req, res, next) => {
    const id = req.params.id || req.body.id
    const users = await getUsers()

    const userIndex = users.findIndex((user) => user.id == id)
    if (userIndex === -1) {
        res.status(404).json({ message: "User Not found" })
    }
    users.splice(userIndex, 1)
    await saveUsers(users)
    res.status(200).json({ message: "User Deleted Successfully" })
})

app.get("/user/:id", async (req, res, next) => {
    const id = req.params.id
    const users = await getUsers()

    const user = users.find((user) => user.id == id)
    if (!user) {
        return res.status(404).json({ message: "User Not found" })
    }
    return res.status(200).json({ user })
})

app.get("/users", async (req, res, next) => {
    const users = await getUsers()
    return res.status(200).json({ users })
})





app.listen(port, () => {
    console.log(`application is running on port:::${port}`)
})