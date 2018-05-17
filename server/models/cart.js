module.exports = mongoose.model('Cart',
  new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      new mongoose.Schema({
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        amount: Number
      })
    ]
  })
)