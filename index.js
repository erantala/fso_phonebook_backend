require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Contact = require('./models/contact')

const app = express()

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

app.use((req, res, next) => {
    if (req.method === 'POST') {
        morgan(':method :url :status :res[content-length] - :response-time ms :body')
            (req, res, next)
    }
    else {
        morgan('tiny')
            (req, res, next)
    }
})

const infoPage = () => {
    return Contact.countDocuments({}).then(count => {
        console.log(count)
        return (`<p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>
            <small>Backend build: ${process.env.BACKEND_SHA || 'dev'} Frontend build: ${process.env.FRONTEND_SHA || 'dev'}</small>`)
    })
}

app.get('/api/persons', (request, response) => {
    Contact.find({}).then(person => {
        response.json(person)
    })
})

app.route('/api/persons/:id')
    .get((request, response, next) => {
        Contact.findById(request.params.id).then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
            .catch(error => next(error))
    })
    .delete((request, response, next) => {
        Contact.findByIdAndDelete(request.params.id)
            .then(result => {
                response.status(204).end()
            })
            .catch(error => next(error))
    })
    .put((request, response, next) => {
        const body = request.body

        const person = {
            name: body.name,
            number: body.number,
        }

        Contact.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
            .then(updatedPerson => {
                if (updatedPerson) {
                    response.json(updatedPerson)
                } else {
                    response.status(404).end()
                }
            })
            .catch(error => next(error))
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
    }

    if (errorMsg) {
        return response.status(400).json({ error: errorMsg })
    }
    next()
}

app.post('/api/persons/', validatePerson, (request, response, next) => {
    console.log('validatePerson passed')

    const reqBody = request.body
    const newPerson = new Contact({
        name: reqBody.name,
        number: reqBody.number,
    })

    newPerson.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    infoPage().then(page => {
        response.send(page)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    switch (error.name) {
        case 'CastError':
            return response.status(400).send({ error: 'malformed id' })
        case 'ValidationError':
            return response.status(400).json({ error: error.message })
        default:
            next(error)
    }
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})