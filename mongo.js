const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const contactName = process.argv[3]
const contactNumber = process.argv[4]

const url = `mongodb+srv://eerorantala:${password}@fso-0.yb2fmqz.mongodb.net`
  + '/phonebook?retryWrites=true&w=majority&appName=fso-0'

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', phonebookSchema)

const addContact = () => {
  const contact = new Contact({
    name: contactName,
    number: contactNumber,
  })

  contact.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}

const listContacts = () => {
  Contact.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 3) {
  listContacts()
} else if (process.argv.length > 3) {
  addContact()
}
