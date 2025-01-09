const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const request = require('request');
const { spawn } = require('child_process');
const customLimiter = require('./middleware/rateLimiter');
const combinedMiddleware = require('./middleware/globalRateLimiter');
const CronService = require('./Services/cronService');


// const ip = '192.168.88.207';

let otpid = '';

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:4200', 'https://www.nisoko.co.ke', "https://nisoko.onrender.com"],
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'], // Restrict to websocket transport
  // No heartbeat settings or ping-pong logic
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle events from the client
  socket.on('cartoperationsevent', (data) => {
    console.log('Received cartoperationsevent:', data);
    // Emit a response back to the client (if needed)
    socket.emit('cartoperationsevent_response', { message: 'Event received successfully' });
  });

  // Handle client disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected (ID: ${socket.id}): ${reason}`);
  });

  // Handle socket errors
  socket.on('error', (err) => {
    console.error(`Socket error on ${socket.id}:`, err.message);
    // Optionally disconnect the socket if needed
    // socket.disconnect(); 
  });
});




// app.set('trust proxy', true);


const router = express.Router();
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Store = require('./models/stores');
const Product = require('./models/products');
const Favorite = require('./models/favorites');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
dotenv.config();
const mongoose = require('./db');
const port = 3000;
// import route files
const userRoutes = require('./routes/userRoutes')(io);
const productRoutes = require('./routes/productRoutes')(io);
const orderRoutes = require('./routes/orderRoutes')(io);

const paymentRoutes = require('./routes/paymentRoutes')
const darajaApiRoutes = require('./routes/darajaApiRoutes')
const sellerRoutes = require('./routes/sellerRoutes')
const notificationRoutes = require('./routes/notifyRoutes')(io);
const authenticator = require('./middleware/authenticator');
const cronService = require('./Services/cronService');
const authRoutes = require('./routes/auth')(io);
const adminRoutes = require('./routes/adminRoutes')(io);


// const authRoutes = require('./routes/auth')
// app.use(cors())
const corsOptions = {
  origin: ['http://localhost:4200', "https://www.nisoko.co.ke", "https://nisoko.onrender.com", "https://nisoko.co.ke"], // Your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};
cronService.startCronJob(io);
app.use(cors(corsOptions));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// routes
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes);
// app.use('/api/users', customLimiter);
// app.use('/api/auth', customLimiter);
// app.use(combinedMiddleware);

// produtected routes
app.use('/api/products', productRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/darajaUrls', darajaApiRoutes)
app.use('/api/sellers', sellerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/orderRoutes', orderRoutes)
app.use('/api/admin', adminRoutes)



// splitting the api
app.get('/', (req, res) => {
    res.send({message: 'request recieved'});
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: err.message });
});

// get products
app.get('/getProducts/:id', async (req, res) => {
  const storeId = req.params.id;
  try {
    // Use the Product model to find products by storeid
    const products = await Product.find({ storeid: storeId });
    if(products.length > 0){ // check if products array is not empty
      res.send({ message: 'Products fetched successfully', success: true, data: products });
    }else{
      res.send({ message: 'No products found', success: false });
    }

  } catch (error) {
    console.error(error.message);
    res.send({ message: error.message, success: false }); // return error message instead of the error object
  }
});




function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Invalid Token' });

  }
  
}



async function sendOtp(zip, phone) {
  const phoneNumber = zip + phone;
  let response;
    try {
      const user = await User.findOne({ phone });
      if (user && user.verificationAttempts >= 2) {
        // If the user has already made a verification attempt, return an error message
        response = "Too many attempts. Try again in 1 hour.";
       
      }
       // use termii
      
    } catch(error){
      response = `Error: ${error}`;
    }

}
// reject or approve listed product items
// app.post('/reviewlisteditem', async(req, res)=>{
//   const product = await Product.findOne({_id:req.body.id});
//   if(product){
//     const verified = product.verified;
//     if(verified){
//       res.status(200).send({message:"Product already verified, Action not completed!"})
//     }else{
//       const filter = {_id: req.body.id};
//       const update = { approved: req.body.action=="approve",rejected:req.body.action=="reject", verified: true, rejectionReason:req.body.reason};
//       const updateproduct = await Product.findOneAndUpdate(filter, update);
    
//       if(updateproduct){
//         res.status(200).send({message: `${req.body.action.toUpperCase()} Action completed successfully`, success: true});
//       }else{
//         res.send({message: "Action Failed", success: false})
//       }
//     }
    
//   }

// })

app.get('/unapprovedproducts', async(req, res)=>{
  try{
    const unapproved = await Product.countDocuments({verified:false}).exec();
    res.status(200).send({number: unapproved, success:true})

  } catch(error){
    res.status(500).send({error: "Internal server error"});
  }
  
})
// mark a product favorite
app.post('/addFavorite', async (req, res)=>{
  const favorite = new Favorite({
      userid:req.body.userid,
      productid:req.body.productid,
      favorite: req.body.favorite
  });
  // check if product has already been added as favorite
  const foundFavorite = await Favorite.findOne({productid:req.body.productid, userid:req.body.userid})
  if(foundFavorite){
    // remove it from favorites
    const deleteProduct = await Favorite.findOneAndDelete({productid:req.body.productid});
      if(deleteProduct){
        res.send({message:'Removed from favorites', success:true})
      }else{
        res.send({message:'Error Occured', success:false})
      }

  }else{
    // add to favorites
    const newFavorite = await favorite.save();
    if(newFavorite){
      res.send({message:'Added to Favorites', success:true})
    }else{
      res.send({message:'Error occured', success: false});
    }
    
  }

 
})
// check if is favorite
app.post('/isFavorite', async (req, res)=>{
  const isfavorite = await Favorite.findOne({productid:req.body.productid, userid:req.body.userid})
  if(isfavorite){
    res.send({success:true})
  }else{
    res.send({success:false})
  }
}) 
// get all the products
// app.get('/getAllProducts', async (req, res)=>{
//   const product = await Product.find({approved:true})
//   if(product){
//     res.status(200).json({data:product, success:true})
//   }else{
//     res.status(404).json({success: false, message:'Could not find the product'})
//   }
// })

app.get('/getAllProducts', async (req, res) => {
  try {
    // Step 1: Fetch all approved products
    const products = await Product.find({ approved: true });

    // Step 2: Create an array to hold the products with store details
    const productsWithStoreDetails = await Promise.all(products.map(async (product) => {
      // Step 3: Fetch the store details for each product using its storeid
      const store = await Store.findById(product.storeid).select('location currency');

      // Step 4: Merge the store details into the product object
      return {
        ...product.toObject(), // Convert product document to plain JavaScript object
        storeLocation: store ? store.location : 'Unknown location', // Include location from Store
        storeCurrency: store ? store.currency : 'Unknown currency', // Include currency from Store
      };
    }));

    // Step 5: Send the response with the merged product and store data
    res.status(200).json({ data: productsWithStoreDetails, success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


app.get('/getCategoryProducts/:category', async (req, res) => {
  try {
    // Extract the category from the route parameters
    const category = req.params.category;

    // Adjust the query to filter by the specified category in a case-insensitive manner
    const products = await Product.find({ category: new RegExp(category, 'i'), approved: true, verified: true });

    if (products.length > 0) {
      res.status(200).json({ data: products, success: true });
    } else {
      res.status(404).json({ success: false, message: 'No products found in the specified category' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// get stores
app.get('/getStores/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const stores = await Store.find({ user: userId });
    res.send({ message: 'Stores fetched successfully', success: true, data: stores });
  } catch (error) {
    console.error(error);
    res.send({ message: 'Server error', success: false });
  }
});
// add product
// app.post('/addProduct', async (req, res) => {
//   const data = req.body;
//   // add the data to mongodb
//     const product = new Product({
//       name: data.name,
//       brand: data.brand,
//       category: data.category,
//       subcategory: data.subcategory,
//       description: data.description,
//       features: data.features,
//       quantity: data.quantity,
//       model: data.model,
//       bp: data.bp,
//       sp: data.sp,
//       avatar: data.images,
//       storeid: data.storeid,
//       discount:0
//     });
//     try{
//       const newProduct = await product.save();
//       res.send({ message: 'Product added successfully', success: true, data: newProduct });
//     }catch(error){
//       console.error(error);
//       res.send({ message: 'Product not Created.', success: false });
//     }

// });
// check if advanced action is allowed
app.post('/advancedAction', async (req, res)=>{
  const userId = req.body.id;

  const person = await User.findOne({_id: userId});
  const hasPermissions = person.aq || person.admin || person.manager || person.support;

  if(hasPermissions){
    res.status(200).send({allowed: true});    
  }else{
    res.status(200).send({allowed: false});
  }
  
})

// review products
app.get('/reviewproducts', authenticator, async (req, res)=>{
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch products' });
  }

});


// add a store
app.post('/addStore', async (req, res) => {
  const data = req.body;
  const user = await User.findOne({ _id: data.userId });
  const store = new Store({
    storename: data.storename,
    storetype: data.storetype,
    location: data.location,
    email: data.email,
    avatar: data.avatar,
    description:data.description,
    user: data.userId
  });
  try {
    const newStore = await store.save();
    // emit a message to the client
    res.send({ message: 'Store added successfully', success: true, data: newStore });
  } catch (error) {
    console.error(error);
    res.send({ message: 'Store not Created.', success: false });
  }



  
  

});
// search for a product
app.post('/searchProduct', async (req, res) => {
  try {
    const searchquery = req.body.query;
    const regexQuery = new RegExp(searchquery, 'i'); // Case-insensitive regex
    const filter = {    
          
        $or: [
          { category: regexQuery },
          { name: regexQuery },
          { subcategory: regexQuery },
          {features: regexQuery},
          {brand: regexQuery},
          {model: regexQuery},
          {description: regexQuery},
  
        ],
        approved:true,
        verified:true,      
      
    };

    // Parse the price and quantity search queries to numbers
    const numericValue = parseFloat(searchquery);
    if (!isNaN(numericValue)) {
      filter.$or.push({ price: numericValue });
      filter.$or.push({ quantity: numericValue });
      filter.$or.push({ bp: numericValue });
      filter.$or.push({ sp: numericValue });
      filter.$or.push({ discount: numericValue });
    }

    const products = await Product.find(filter);

    if (products.length > 0) { // Check if products array has items
      res.status(200).send({success:true, data:products});
    } else {
      res.send({success:false, message:'Product not found'});

    }
  } catch (error) {
    res.send({success:false, message:error});

  }
});




// get user data using their mobile phone
app.get('/getUser/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // find user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // handle case where user is not found
    }else{
      res.send({ message: 'User found', success: true, data: user });
    }// return user object if found
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' }); // handle other errors
  }
});


app.post('/editProduct', async (req, res)=>{  
  const product = await Product.find({_id:req.body.id});
  if(product){
    const filter = {_id: req.body.id};
    const update = {bp:req.body.bp, sp:req.body.sp, quantity:req.body.qtty,discount:req.body.discount,avatar:req.body.images, approved:false, verified:false, description: req.body.description, features:req.body.features, rejected:false, rejectionReason:""}
    const productUpdate = await Product.findOneAndUpdate(filter, update);
    if(productUpdate){
      res.status(200).send({message: "Product Details Edited Successfully", success:true});
    }else{
      res.send({message: "Error: Something Happend", success:false})
    }

  }else{
    res.status(400).send({message: 'Product Not Found', success:false})
  }

})
// lazy loading products
app.post('/getlazyLoadedProducts', async (req, res)=>{
    const startIndex = req.body.startIndex;
    const batchSize = req.body.batchSize;
    // try
    try{
      const products = await Product.find({approved:true, verified:true}).skip(startIndex).limit(batchSize);
      res.status(200).send({success: true, data:products})
    } catch(error){
      res.status(500).send({success:false, err: error})
    }

})

  // delete product
app.delete('/deleteProduct/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    } else {
      res.send({ message: 'Product deleted', success: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// get store details
app.get('/getStoreDetails/:id', async (req, res) => {
  const storeid = req.params.id;
  const store = await Store.find({_id: storeid});
  if(store){
    res.status(200).send({ message: `Store details`, success: true, data: store});
  }else{
    res.send({ message: 'Store not found', success: false });
  }
});


app.post('/sendOTP', async (req, res) => {
  if (!req.body.phone || !req.body.zip) {
    return res.status(400).json({ message: 'Missing required fields', success: false });
  }

  const data = {
    "api_key" : process.env.TERMII_API_KEY,
    "message_type" : "ALPHANUMERIC",
    "to" : req.body.zip.slice(1)+req.body.phone.slice(1),
    "from" : process.env.TERMII_SENDER_ID,
    "channel" : "generic",
    "pin_attempts" : 10,
    "pin_time_to_live" :  5,
    "pin_length" : 6,
    "pin_placeholder" : "< 1234 >",
    "message_text" : "Your one time password for MARKET BASKET is < 1234 >",
    "pin_type" : "NUMERIC"
  }
  const options = {
    'method': 'POST',
    'url': 'https://api.ng.termii.com/api/sms/otp/send',
    'headers': {
      'Content-Type': ['application/json', 'application/json']
    },
    body: JSON.stringify(data)
  
  };
  request(options, async function (error, response) { 
    if (error){
      response = "Error: " + error;
    }else{
      const responseData = JSON.parse(response.body);
      if(responseData && responseData.smsStatus === 'Message Sent'){
        verifydatadata = {zip: req.body.zip, phone: req.body.phone, pinid: responseData.pinId }
        res
          .status(200)
          .send({ message: `OTP sent`, success: true, data: verifydatadata});
          const user = User.findOne({ phone: req.body.phone})
        if (user) {
          const phone = req.body.phone
          // If the user already exists, increment their verification attempts by 1
          await User.findOneAndUpdate({ phone}, { $inc: { verificationAttempts: 1 } });
        } else {
          // If the user doesn't exist yet, create a new user and set their verification attempts to 1
          await User.create({ phone, verificationAttempts: 0 });
        }

      }
    } 
  });
});

app.get('/getProductDetails/:id', async(req, res)=>{
    const product = await Product.find({_id:req.params.id});
    if(product){
      res.status(200).send({productDetails: product, success:true})
    }else{
      res.status(404).send({success: false});
    }
});
function findAndKillProcessesUsingPort(port, callback) {
  try {
    const command = getNetstatCommand(port);
    const childProcess = spawn(command, { shell: true });

    let stdout = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data;
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Error finding processes: Command exited with code ${code}`);
      }
    });

    // Process the output of the command and take appropriate actions
    childProcess.on('exit', () => {
      const processInfoLines = stdout.trim().split('\n');
      const processIds = getProcessIds(processInfoLines);

      if (processIds.length > 0) {
        console.log(`Processes using port ${port}:`, processIds);

        processIds.forEach((pid) => {
          console.log(`Attempting to kill process ${pid}...`);
          if (processExists(pid)) {
            process.kill(Number(pid));
            console.log(`Process ${pid} killed successfully.`);
          } else {
            console.log(`Process ${pid} does not exist.`);
          }
        });

        // Notify the server to restart only after killing processes
        console.log('Notifying the server to restart...');
        callback();
      } else {
        console.log(`No processes found using port ${port}.`);

        // Notify the server to restart directly if no processes were found
        console.log('Notifying the server to restart...');
        callback();
      }
    });
  } catch (error) {
    console.error('Error finding and killing processes:', error);
  }
}

// Function to check if a process with the given PID exists
function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

// Function to get the appropriate netstat/lsof command based on the operating system
function getNetstatCommand(port) {
  switch (process.platform) {
    case 'win32':
      return `netstat -ano | find ":${port}" | find "LISTENING"`;
    case 'darwin':
    case 'linux':
      return `lsof -i:${port} -t -sTCP:LISTEN,ESTABLISHED`;
    default:
      throw new Error(`Unsupported operating system: ${process.platform}`);
  }
}

// Function to extract process IDs from the output of the netstat/lsof command
function getProcessIds(processInfoLines) {
  return processInfoLines
    .filter(line => line.includes(`:${port}`) && (line.includes('LISTEN') || line.includes('ESTABLISHED')))
    .map(line => {
      const parts = line.trim().split(/\s+/);
      return parts[parts.length - 1];
    })
    .filter(pid => !isNaN(pid))
    .filter(Boolean);
}

// Server setup
let serverStarted = false;

const startServer = () => {
  if (!serverStarted) {
    server.listen(port, (error) => {
      if (error) {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is already in use. Attempting to free up the port...`);
          findAndKillProcessesUsingPort(port, startServer);
        } else {
          console.error('Error starting server:', error);
          process.exit(1); // Exit the process if an error occurs
        }
      } else {
        console.log(`Server is running on ${process.platform} localhost:${port}`);
        serverStarted = true;
      }
    });
  }
};

// Handle unhandled 'error' events to avoid crashing
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Attempting to free up the port...`);
    findAndKillProcessesUsingPort(port, startServer);
  } else {
    console.error('Server error:', error);
    process.exit(1); // Exit the process if an error occurs
  }
});

startServer();