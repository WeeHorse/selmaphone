const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const clientPath = '../client/';
const restPath = '/rest';

// we set the db global because we only want one mongoose connection and instance across the application
global.mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/selmaphone');
// mongoose.connection.on('error', (e)=>{ console.error(e); });
// mongoose.connection.once('open', ()=>{ console.info('db connected');});

// so lets try mysql 8 with their shiny new mysqlx connector
const mysqlx = require('@mysql/xdevapi');

const options = {
  host: 'localhost',
  port: 33060,
  password: 'mysqlmysql', // mysqlmysql
  user: 'root',
  schema: 'selmaphone'
};

(async function () {
  let mysql;
  let statement = 'SELECT * FROM selmaphone.cart'; // CREATE TABLE selmaphone.cart (id INT) // 'ALTER TABLE selmaphone.cart ADD title VARCHAR(255)'

  try {
    mysql = await mysqlx.getSession(options);
    const collection = await mysql.getSchema(options.schema);
    console.log('collection', collection);
    //let result = await mysql.sql('DROP TABLE selmaphone.cart').execute();
    //result = await mysql.sql('CREATE TABLE selmaphone.cart (id INT AUTOINCREMENT)').execute();
    //let table = await collection.getTable('cart')
    //          .insert({'title': 'foobar'})
    //          .execute();
    // let result = await table.select();
    // result = await result.execute();
    collection.getTable('cart')
            .select(['title'])
            .execute(row => {
                console.log(row); // ['foo', 42]
            });
    //console.log('mysql result', result);
  } catch (err) {
    console.error(err.message);
  } finally {
    mysql && mysql.close();
  }
})();


// Create an Express app
const app = express();
// with body parser (needed to post json)
app.use(bodyParser.json())

// serve frontend files (excluded from ACL)
app.use(express.static(clientPath));

// Sessions, Users and Access control middleware
const AccessManager = require('access-manager');
const accessManager = new AccessManager({
  mongoose: mongoose,
  expressApp: app,
  userSchema: {
    email: {type: String, required:true, unique:true},
    password: {type: String, required:true},
    roles: [String],
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart'}
  }
});

// MODELS
const Product = require('./models/product.js');
const Cart = require('./models/cart.js');

// User model
const User = accessManager.models.user;



// ROUTES

// registration
app.post(restPath + '/register', async (req, res)=>{
  // encrypt password
  req.body.password = await bcrypt.hash(req.body.password, saltRounds);
  req.body.roles = ['user']; // we should really use a temp role and then change it to user upon confirm
  // create user
  let user = await new User(req.body);
  await user.save();
  // confirm registration (but not the password)
  user.password = '******';
  res.json(user);
});

// current user data
app.get(restPath + '/user', (req, res)=>{
  // check if there is a logged-in user and return that user
  let response;
  if(req.user._id){
    response = req.user;
    // never send the password back
    response.password = '******';
  }else{
    response = {message: 'Not logged in'};
  }
  res.json(response);
});

// login
app.post(restPath + '/login', async (req, res)=>{
  let response = {message: 'Bad credentials'}; // default
  if(req.user._id){
    response = {message: 'Already logged in'};
  }else{
    // encrypt
    let user = await User.findOne({email: req.body.email});
    if(user){
      let passwordsMatch = await bcrypt.compare(req.body.password, user.password);
      if(passwordsMatch){
        req.session.user = user._id;
        req.session.loggedIn = true;
        await req.session.save(); // save the userId and login to the session
        // below to avoid sending the password to the client
        user.password = '******';
        response = {message: 'Logged in', user: user};
      }
    }
  }
  res.json(response);
});

// logut
app.all(restPath + '/logout', async (req, res)=>{
  //  we opt to remove the login, but keep the session
  req.user = {};
  req.session.loggedIn = false;
  let result = await req.session.save();
  res.json({message: 'Logged out', session: req.session, user: req.user});
});

// create a product
app.post(restPath + '/product', async (req, res)=>{
  let product = await new Product(req.body);
  await product.save();
  // confirm
  res.json(product);
});

// get products
app.get(restPath + '/products', async (req, res)=>{
  let products = await Product.find();
  res.json(products);
});

// get product
app.get(restPath + '/product/:id', async (req, res)=>{
  let product = await Product.find({_id:req.params.id});
  res.json(product);
});

// add a product to the shopping cart
app.post(restPath + '/cart', async (req, res)=>{
  // do we have a shopping cart?
  if(!req.user.cart){
    let cart = await new Cart({user:req.user._id});
    await cart.save();
    req.user.cart = cart;
    await req.user.save();
  }
  // confirm
  res.json(req.user.cart);
});

// any possible routes (with any method) that we have not already defined
// (so we can test the ACL)
app.all(restPath + '/*', (req, res)=>{
  res.json({params: req.params, body: req.body}); // just return some debugging, the ACL block happens in the ACL module
});

// Start the Express app on port 3000
app.listen(3000,()=>{
  console.log("Mystery Science Theatre 3000!");
});