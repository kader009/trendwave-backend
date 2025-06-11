import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import validateRequest from './src/middleware/validateRequest.js';
import { userCreateValidation } from './src/validation/userValidation.js';
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://trendwave-frontend.vercel.app',
    ],
    credentials: true,
  })
);
app.use(cookieParser());
dotenv.config();

// verify token
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }

  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: 'Unauthorized Access' });
    }
    console.log(process.env.ACCESS_TOKEN_SECRET);
    req.decoded = decoded;
    next();
  });
};

// mongodb url
const uri = process.env.DATABASE_URL;

// mongodb client connection
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // All DB collection here
    const database = client.db('trendwave');
    const ProductCollection = database.collection('products');
    const UserCollection = database.collection('user');
    const OrderCollection = database.collection('orders');
    const WishlistCollection = database.collection('wishlist');

    // get all product data
    app.get('/api/v1/products', async (req, res) => {
      const productdata = await ProductCollection.find().toArray();
      res.status(200).send(productdata);
    });

    // post product data
    app.post('/api/v1/products', async (req, res) => {
      const Createproducts = req.body;
      const result = await ProductCollection.insertOne(Createproducts);
      res.status(200).send(result);
    });

    // get top popular products
    app.get('/api/v1/popular', async (req, res) => {
      try {
        const PopularProduct = await ProductCollection.find()
          .sort({ rating: -1 })
          .limit(8)
          .toArray();
        res.status(200).json({
          message: 'Popular product get successfully',
          PopularProduct,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({
          message: 'popular products not found.',
          error: error.message,
        });
      }
    });

    // get product with flash sale
    app.get('/api/v1/flash-sale', async (req, res) => {
      try {
        const query = {
          totalSales: { $gt: 200 },
          rating: { $gte: 4.0 },
        };
        const FlashSale = await ProductCollection.find(query)
          .sort()
          .limit(12)
          .toArray();
        res
          .status(200)
          .json({ message: 'flash sale product get successfully', FlashSale });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'flash sale products not found.' });
      }
    });

    // top category list
    app.get('/api/v1/category', async (req, res) => {
      try {
        const query = {
          totalSales: { $gt: 200 },
          rating: { $gte: 3.6 },
        };
        const Category = await ProductCollection.find(query)
          .sort()
          .limit(4)
          .toArray();
        res
          .status(200)
          .json({ message: 'category product get successfully', Category });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'category products not found.' });
      }
    });

    // single product get here
    app.get('/api/v1/products/:id', async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid product ID format' });
      }

      try {
        const Productdata = await ProductCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!Productdata) {
          return res.status(404).send({ message: 'Product not found' });
        }

        res
          .status(200)
          .send({ message: 'Product get successfully', Productdata });
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ message: 'Server error', error });
      }
    });

    // single product delete here
    app.delete('/api/v1/products/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const deleteNote = await ProductCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (deleteNote.deletedCount === 1) {
          res
            .status(200)
            .json({ successs: true, message: 'product delete successfully.' });
        } else {
          res
            .status(404)
            .json({ successs: false, message: 'product not found.' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete the product.' });
      }
    });

    // update session data approve
    app.patch('/api/v1/session/approve/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const updateSession = await SessionCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: 'approved' } }
        );
        if (updateSession.matchedCount === 0) {
          res.status(404).json({ message: 'session not found.' });
        }

        res.json({ message: 'session update successfully.' });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to approve session.' });
      }
    });

    // get product based on seller email
    app.get('/api/v1/products/email/:email', async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      try {
        const productForseller = await ProductCollection.find(query).toArray();
        res.send(productForseller);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'server error', error }); 
      }
    });

    // admin product update here
    app.patch('/api/v1/products/:id', async (req, res) => {
      const { id } = req.params;
    
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
    
      const updatedData = req.body;
    
      try {
        const result = await ProductCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        const updatedSession = await ProductCollection.findOne({
          _id: new ObjectId(id),
        });
    
        res.status(200).json({
          message: 'Product updated successfully',
          updatedSession,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update product' });
      }
    });
    
    

    // material post route for database
    app.post('/api/v1/material', async (req, res) => {
      const material = req.body;
      const saveMaterial = await MaterialCollection.insertOne(material);
      res.send(saveMaterial);
    });

    // get material based on the email
    app.get('/api/v1/material/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { TutorEmail: email };
      try {
        const sessionMaterial = await MaterialCollection.find(query).toArray();
        res.send(sessionMaterial);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'server error', error });
      }
    });

    

    // update material from the tutor
    app.patch('/api/v1/material/:id', async (req, res) => {
      const { id } = req.params;
      const { TutorEmail, UploadImages, GoogledriveLink } = req.body;

      const updateData = {};
      if (TutorEmail) updateData.TutorEmail = TutorEmail;
      if (UploadImages) updateData.UploadImages = UploadImages;
      if (GoogledriveLink) updateData.GoogledriveLink = GoogledriveLink;

      try {
        const updateMaterial = await MaterialCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        if (updateMaterial.matchedCount === 0) {
          res.status(404).json({ message: 'material not found.' });
        }

        res.json({ message: 'material update successfully.' });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to update material.' });
      }
    });

    // get all orders route
    app.get('/api/v1/orders', async (req, res) => {
      const getAllOrders = await OrderCollection.find().toArray();
      res.send(getAllOrders);
    });

    // orders post for customer
    app.post('/api/v1/orders', async (req, res) => {
      const {
        productId,
        productName,
        category,
        rating,
        price,
        image,
        customerEmail,
        paymentStatus,
        orderDate,
      } = req.body;

      try {
        const result = await OrderCollection.insertOne({
          productId,
          productName,
          category,
          rating,
          price,
          image,
          customerEmail,
          paymentStatus,
          orderDate,
        });

        if (result.insertedId) {
          return res.status(200).json({
            message: 'Order added successfully',
            insertedId: result.insertedId,
          });
        } else {
          return res.status(500).json({
            error: ' failed to insert order data in to the database',
          });
        }
      } catch (error) {
        console.error('Error in order session', error);
        res.status(500).json({ error: 'internal server error' });
      }
    });

    // post wishlist data
    app.post('/api/v1/wishlist', async (req, res) => {
      const {
        productId,
        productName,
        category,
        rating,
        price,
        image,
        customerEmail,
      } = req.body;

      try {
        const result = await WishlistCollection.insertOne({
          productId,
          productName,
          category,
          rating,
          price,
          image,
          customerEmail,
        });

        if (result.insertedId) {
          return res.status(200).json({
            message: 'Wishlist added successfully',
            insertedId: result.insertedId,
          });
        } else {
          return res.status(500).json({
            error: ' failed to insert Wishlist data in to the database',
          });
        }
      } catch (error) {
        console.error('Error in Wishlist', error);
        res.status(500).json({ error: 'internal server error' });
      }
    });

    // delete wishlist from customar dashboard
    app.delete('/api/v1/orders/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const deleteOrder = await OrderCollection.deleteOne({ 
          _id: new ObjectId(id),
        });

        if (deleteOrder.deletedCount === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'failed to delete Order' });
      }
    });

    // delete wishlist from customar dashboard
    app.delete('/api/v1/wishlist/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const deleteWishlist = await WishlistCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (deleteWishlist.deletedCount === 0) {
          return res.status(404).json({ error: 'Wishlist not found' });
        }

        res.status(200).json({ message: 'Wishlist deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'failed to delete Wishlist' });
      }
    });

    // orders query by email
    app.get('/api/v1/orders/:email', async (req, res) => {
      const email = req.params.email;
      const query = { customerEmail: email };
      const getOrder = await OrderCollection.find(query).toArray();
      res.send(getOrder);
    });

    // orders query by email
    app.get('/api/v1/wishlist/:email', async (req, res) => {
      const email = req.params.email;
      const query = { customerEmail: email };
      const getOrder = await WishlistCollection.find(query).toArray();
      res.send(getOrder);
    });

    // get orders by id
    app.get('/api/v1/orders/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const query = { SessionId: id };
        const session = await MaterialCollection.find(query).toArray();
        console.log('sessionId', session);

        if (!session || session.length === 0) {
          return res.status(404).json({
            message: 'session not found',
          });
        }

        res
          .status(200)
          .json({ msessage: 'session fetch successfully', session });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          message: 'failed to get booked session',
        });
      }
    });

    // user create and save in the database
    app.post(
      '/api/v1/create-user',
      validateRequest(userCreateValidation),
      async (req, res) => {
        const data = req.body;
        const email = data.email;
        try {
          const existingUser = await UserCollection.findOne({ email });

          if (existingUser) {
            res.status(409).send({
              successs: false,
              message: 'Email already exist in the database',
            });
          }
          const result = await UserCollection.insertOne(data);
          res.send({
            successs: true,
            message: 'User created successfully.',
            result,
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({
            successs: false,
            message: 'External server error.',
          });
        }
      }
    );

    // get all user here
    app.get('/api/v1/user', async (req, res) => {
      const allUser = await UserCollection.find().toArray();
      res.send(allUser);
    });

    // update user role
    app.patch('/api/v1/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateRole = { $set: { role: 'admin' } };
      const allUser = await UserCollection.updateOne(query, updateRole);
      res.send(allUser);
    });

    // login user
    app.post('/api/v1/login', async (req, res) => {
      const { email, password } = req.body;

      const user = await UserCollection.findOne({ email });

      if (!user) {
        res.status(404).send({ error: 'user not found' });
      }

      if (user.password !== password) {
        res.status(401).send({ error: 'invalid password' });
      }

      const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).send({
        success: true,
        message: 'Login successful',
        user,
        token,
      });
    });

    console.log('You successfully connected to MongoDB!');
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('trendwave server is on');
});

app.listen(port, () => {
  console.log(`Trendwave server is on ${port}`);
});
