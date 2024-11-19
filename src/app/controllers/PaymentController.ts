import { Request, Response } from 'express';

import { CustomersRepository } from '../repositories/CustomersRepository';
import { PaymentsRepository } from '../repositories/PaymentsRepository';
import {
	generalServerError,
	mandatoryFieldsRequired,
	paymentNotFound,
} from '../utils/errors';
import logger from '../utils/logger';
import { StatusCode } from '../utils/statusCodes';
import { verifyRequiredFields } from '../utils/validations';

const PaymentsRepositoryFunction = new PaymentsRepository();
const CustomersRepositoryFunction = new CustomersRepository();

export class PaymentController {
	/** ------------------------------------------------------------------
	 * @function list
	 * List all payments
	 */
	async list(req: Request, res: Response) {
		logger.info('list >> Start >>');

		try {
			const payments = await PaymentsRepositoryFunction.findAll();
			logger.info('list << End <<');
			res.status(StatusCode.SUCCESS).json(payments);
		} catch (error) {
			logger.error('list :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	async listByCustomer(req: Request, res: Response) {
		logger.info('listByCustomer >> Start >>');
		const { customerId } = req.params;

		try {
			const appointments =
				await PaymentsRepositoryFunction.findByCustomerId(customerId);
			logger.info('listByCustomer << End <<');
			res.status(StatusCode.FOUND).json(appointments);
		} catch (error) {
			logger.error('listByCustomer :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------
	 * @function find
	 * Find a specific payment
	 */
	async find(req: Request, res: Response) {
		logger.info('find >> Start >>');
		const { id } = req.params;

		try {
			const payment = await PaymentsRepositoryFunction.findById(id);

			if (!payment) {
				logger.error('find :: Error :: Payment not found');
				return res.status(StatusCode.NOT_FOUND).json(paymentNotFound);
			}

			logger.info('find << End <<');
			res.status(StatusCode.SUCCESS).json(payment);
		} catch (error) {
			logger.error('find :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------
	 * @function create
	 * Create a new payment
	 */
	async create(req: Request, res: Response) {
		logger.info('create >> Start >>');
		const { customerId, appointmentId, amount, paymentType, paymentDate } =
			req.body;

		const requiredFields = verifyRequiredFields({
			customerId,
			amount,
			paymentType,
		});

		try {
			if (requiredFields.length > 0) {
				logger.error('create :: Error :: Missing fields');
				return res.status(StatusCode.BAD_REQUEST).json({
					error: mandatoryFieldsRequired,
					fields: requiredFields,
				});
			}

			const payment = await PaymentsRepositoryFunction.create({
				customerId,
				appointmentId,
				amount,
				paymentType,
				paymentDate: paymentDate || new Date(),
				status: 'pending', // Default status
			});

			logger.info('create << End <<');
			res.status(StatusCode.CREATED).json(payment);
		} catch (error) {
			logger.error('create :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------
	 * @function update
	 * Update a payment
	 */
	async update(req: Request, res: Response) {
		logger.info('update >> Start >>');
		const { id } = req.params;
		const {
			customerId,
			appointmentId,
			amount,
			paymentType,
			status,
			paymentDate,
		} = req.body;

		try {
			const payment = await PaymentsRepositoryFunction.findById(id);

			if (!payment) {
				logger.error('update :: Error :: Payment not found');
				return res.status(StatusCode.NOT_FOUND).json(paymentNotFound);
			}

			const updatedPayment = await PaymentsRepositoryFunction.update(id, {
				customerId,
				appointmentId,
				amount,
				paymentType,
				paymentDate,
				status,
			});

			logger.info('update << End <<');
			res.json(updatedPayment);
		} catch (error) {
			logger.error('update :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------
	 * @function delete
	 * Delete a payment
	 */
	async delete(req: Request, res: Response) {
		logger.info('delete >> Start >>');
		const { id } = req.params;

		try {
			const payment = await PaymentsRepositoryFunction.findById(id);

			if (!payment) {
				logger.error('delete :: Error :: Payment not found');
				return res.status(StatusCode.NOT_FOUND).json(paymentNotFound);
			}

			await PaymentsRepositoryFunction.delete(id);
			logger.info('delete << End <<');
			res.sendStatus(StatusCode.NO_CONTENT);
		} catch (error) {
			logger.error('delete :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------
	 * @function report
	 * Generate financial reports
	 */
	async report(req: Request, res: Response) {
		logger.info('generateReport >> Start >>');

		const { startDate, endDate } = req.query;

		try {
			const start = new Date(
				String(startDate).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'),
			);
			const end = new Date(
				String(endDate).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'),
			);

			const customers = await CustomersRepositoryFunction.findAll();

			const report = customers.map((customer: any) => {
				const total =
					customer.paymentType === 'per_session'
						? customer.balanceDue
						: customer.monthlyRate;
				return {
					customerId: customer._id,
					name: customer.name,
					email: customer.email,
					paymentType: customer.paymentType,
					total,
				};
			});

			logger.info('generateReport << End <<');
			res.status(StatusCode.SUCCESS).json(report);
		} catch (error) {
			logger.error('generateReport :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}
}
