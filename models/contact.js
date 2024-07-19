const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(_result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: [
      {
        validator: v => v.length >= 8,
        message: _props => 'Phone number must contain atleast 8 characters!'
      },
      {
        validator: v => /^\d{2,3}-\d+$/.test(v),
        message: _props => 'Phone number must contain atleast 2-3 digits followed by a hyphen and more digits!'
      }
    ],
    required: true
  },
})

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', phonebookSchema)