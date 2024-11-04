// The router purpose is to send the requests to Controllers and activate his methods. The Controller will connect with Repository, that will connect with Data Source and return to Controller the result

import { Router } from 'express';

import { AppointmentController } from '../controllers/AppointmentController';
import { AuthController } from '../controllers/AuthController';
import { CustomerController } from '../controllers/CustomerController';

const CustomerControllerFunction = new CustomerController();
const AppointmentControllerFunction = new AppointmentController();
const AuthControllerFunction = new AuthController();

export const router = Router();

router.get(
	'/customers',
	// AuthControllerFunction.verifyToken,
	CustomerControllerFunction.list,
);
router.get('/customers/:id', CustomerControllerFunction.find);
router.get('/customers/birthday', CustomerControllerFunction.listAllBirthdays);
router.delete('/customers/:id', CustomerControllerFunction.delete);
router.post('/customers/', CustomerControllerFunction.createPatient);
router.put('/customers/:id', CustomerControllerFunction.update);

router.post('/login', AuthControllerFunction.login);
router.post(
	'/authenticatedRoute',
	// AuthControllerFunction.verifyToken,
	CustomerControllerFunction.list,
);

router.post('/customers/appointment', CustomerControllerFunction.createPatient);

router.get('/appointments', AppointmentControllerFunction.list);
router.get(
	'/customers/:customerId/appointments',
	AppointmentControllerFunction.listByCustomer,
);
router.get(
	'/appointments/:appointmentId',
	AppointmentControllerFunction.findById,
);

router.post('/appointments', AppointmentControllerFunction.create);
router.put(
	'/appointments/:appointmentId',
	AppointmentControllerFunction.update,
);
router.delete(
	'/appointments/:appointmentId',
	AppointmentControllerFunction.delete,
);
