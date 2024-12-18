import path from 'path';

import { Router } from 'express';
import multer from 'multer';

import { AppointmentController } from '../controllers/AppointmentController';
import { CustomerController } from '../controllers/CustomerController';
import { DoctorController } from '../controllers/DoctorController';
import { PaymentController } from '../controllers/PaymentController';

const CustomerControllerFunction = new CustomerController();
const AppointmentControllerFunction = new AppointmentController();
const DoctorControllerFunction = new DoctorController();
const PaymentsControllerFunction = new PaymentController();

export const router = Router();
const upload = multer({ dest: path.resolve(__dirname, '..', 'uploads') });

// Customers Routes
router.get('/customers', CustomerControllerFunction.list);
router.get('/customers/birthday', CustomerControllerFunction.listAllBirthdays);
router.get('/customers/:id', CustomerControllerFunction.find);
router.post('/customers', CustomerControllerFunction.createPatient);
router.post(
	'/customers/import',
	upload.single('file'),
	CustomerControllerFunction.importCustomers,
);
router.put('/customers/:id', CustomerControllerFunction.update);
router.delete('/customers/:id', CustomerControllerFunction.delete);

// Auth Routes
router.post('/login', DoctorControllerFunction.login);
router.post('/authenticatedRoute', CustomerControllerFunction.list);

// Appointments Routes
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

// Payments Routes
router.get('/payments', PaymentsControllerFunction.list);
router.get('/payments/report', PaymentsControllerFunction.report);
router.get('/payments/:id', PaymentsControllerFunction.find);
router.get(
	'/customers/:customerId/payments',
	PaymentsControllerFunction.listByCustomer,
);
router.post('/payments', PaymentsControllerFunction.create);
router.put('/payments/:id', PaymentsControllerFunction.update);
router.delete('/payments/:id', PaymentsControllerFunction.delete);
