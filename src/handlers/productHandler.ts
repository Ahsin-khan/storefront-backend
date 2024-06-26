import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';

const store = new ProductStore();

const index = async (_req: Request, res: Response) => {
  try {
    const products = await store.index();
    res.json(products);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const product: Product = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category
    };

    const newProduct = await store.create(product);
    res.json(newProduct);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

const show = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const product = await store.show(parseInt(id));
    res.status(200);
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const product: Product = {
      id: parseInt(req.params.id),
      name: req.body.name,
      price: req.body.price,
      category: req.body.category
    };

    const updatedProduct = await store.update(product);
    res.json(updatedProduct);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productDeleted = await store.delete(req.params.id);
    res.json(productDeleted);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getProductByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.params.category;

    // Call the appropriate method in your store/model to fetch products by category
    const products = await store.getProductsByCategory(category);

    res.json(products);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      res.status(401).json('Authorization header missing');
      return; // Stop further execution
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      res.status(401).json('Token not found');
      return; // Stop further execution
    }

    // Verify the token
    jwt.verify(token, process.env.TOKEN_SECRET as string, (err) => {
      if (err) {
        // JWT verification failed
        res.status(401).json('Invalid token');
        return; // Stop further execution
      }
      // JWT verification succeeded
      next();
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const productRoutes = (app: express.Application) => {
  app.post('/products', verifyAuthToken, create);
  app.get('/products', verifyAuthToken, index);
  app.get('/products/:id', verifyAuthToken, show);
  app.put('/products/:id', verifyAuthToken, update);
  app.delete('/products/:id', verifyAuthToken, deleteProduct);
  app.get(
    '/products/category/:category',
    verifyAuthToken,
    getProductByCategory
  );
};

export { productRoutes };
