const express = require('express')
const app = express()

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    },
    {
        name: "Linus Torvalds",
        number: "040-123 54689",
        id: 5
    }
]

app.use(express.json())

const infoPage = () => {
    return (`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`)
}

const generateRandomId = () => {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const validatePerson = (request, response, next) => {
    console.log('validatePerson')
    console.log(request.body)
    const reqBody = request.body
    let errorMsg = null

    if (!reqBody.name) {
        errorMsg = 'name is missing'
    } else if (!reqBody.number) {
        errorMsg = 'number is missing'
    } else if (persons.find(person => person.name === reqBody.name)) {
        errorMsg = 'name must be unique'
    }

    if (errorMsg) {
        return response.status(400).json({ error: errorMsg })
    }
    next()
}

app.post('/api/persons/', validatePerson, (request, response) => {
    console.log('validatePerson passed')
    const reqBody = request.body
    const newPerson = {
        name: reqBody.name,
        number: reqBody.number,
        id: generateRandomId()
    }
    persons.push(newPerson)
    response.json(newPerson)
})

app.get('/info', (request, response) => {
    response.send(infoPage())
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})