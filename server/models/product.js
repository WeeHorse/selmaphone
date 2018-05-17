module.exports = mongoose.model('Product',
  new mongoose.Schema({
    title: {type: String, required:true},
    content: {type: String},
    price: {type: Number}
  })
)