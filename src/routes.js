import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import PackageController from './app/controllers/PackageController';
import DeliverymanFunctionalities from './app/controllers/DeliverymanFunctionalities';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import DeliveredController from './app/controllers/DeliveredController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.put(
  '/deliveryman/:id/packages/:package_id/delivered',
  upload.single('file'),
  DeliveredController.update
);

routes.get('/deliveryman/:id/packages', DeliverymanFunctionalities.index);
routes.put(
  '/deliveryman/:id/packages/:package_id/withdraw',
  DeliverymanFunctionalities.update
);

routes.get('/deliveryproblems', DeliveryProblemController.index);
routes.get('/package/:id/problems', DeliveryProblemController.show);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.delete(
  '/deliveryproblems/:id/cancel',
  DeliveryProblemController.destroy
);

routes.use(authMiddlewares);

routes.put('/users', UserController.update);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients/:id', RecipientController.show);

routes.post('/deliveryman', DeliverymanController.store);
routes.get('/deliveryman', DeliverymanController.index);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.get('/deliveryman/:id', DeliverymanController.show);
routes.delete('/deliveryman/:id', DeliverymanController.destroy);

routes.get('/delivery', PackageController.index);
routes.post('/delivery', PackageController.store);
routes.put('/delivery/:id', PackageController.update);
routes.get('/delivery/:id', PackageController.show);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
