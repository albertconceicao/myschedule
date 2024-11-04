import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { CustomersRepository } from '../repositories/CustomersRepository';
import {
	customerNotFound,
	emailAlreadyExists,
	generalServerError,
	mandatoryFieldsRequired,
} from '../utils/errors';
import logger from '../utils/logger';
import { StatusCode } from '../utils/statusCodes';
import { verifyRequiredFields } from '../utils/validations';

const CustomersRepositoryFunction = new CustomersRepository();

export class CustomerController {
	/** ------------------------------------------------------------------------------
	 * @function list
	 * @param req
	 * @param res
	 */
	async list(req: Request, res: Response) {
		logger.info('list >> Start >>');

		const orderBy: string | undefined = req.query.orderBy
			? String(req.query.orderBy)
			: undefined;

		try {
			const customers = await CustomersRepositoryFunction.findAll(orderBy);
			logger.info('list << End <<');
			res.status(StatusCode.FOUND).json(customers);
		} catch (error) {
			logger.error('list :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/**
	 * @function find
	 * @param req
	 * @param res
	 */
	async find(req: Request, res: Response) {
		logger.info('find >> Start >>');
		// List a specific records
		const { id } = req.params;
		logger.debug('id: ', id);
		try {
			const customer = await CustomersRepositoryFunction.findById(id);

			if (!customer) {
				return res.status(404).json({ error: 'User not found' });
			}
			logger.info('find << End <<');
			res.status(StatusCode.FOUND).json(customer);
		} catch (error) {
			logger.error('find :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	async listAllBirthdays(req: Request, res: Response) {
		logger.info('listAllBirthdays >> Start >>');
		logger.info('here1');
		try {
			logger.info('here2');
			const birthdays = await CustomersRepositoryFunction.findAllBirthdays();

			logger.info('listAllBirthdays << End <<');
			res.status(StatusCode.FOUND).json(birthdays);
		} catch (error) {
			logger.error('listAllBirthdays :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------------------
	 * @function create
	 * @param req
	 * @param res
	 */
	async createPatient(req: Request, res: Response) {
		logger.info('create >> Start');
		// Create a new records
		const { name, email, phone, password, birthday } = req.body;
		logger.debug(
			`name: ${name} , email: ${email}, phone: ${phone}, birthday: ${birthday}`,
		);
		const requiredFields = verifyRequiredFields({ name, email });

		try {
			const hashedPassword = bcrypt.hashSync(password, 10);

			if (requiredFields.length > 0) {
				logger.error('create :: Error :: ', mandatoryFieldsRequired.message);
				logger.debug('create :: Error :: Fields ', requiredFields);
				return res
					.status(StatusCode.BAD_REQUEST)
					.json({ error: mandatoryFieldsRequired, fields: requiredFields });
			}

			const customerExists =
				await CustomersRepositoryFunction.findByEmail(email);

			if (customerExists) {
				logger.error('create :: Error :: ', emailAlreadyExists.message);
				logger.debug('create :: Error :: Email :', email);
				return res.status(StatusCode.BAD_REQUEST).json(emailAlreadyExists);
			}
			const customer = await CustomersRepositoryFunction.createPatient({
				name,
				email,
				phone,
				password: hashedPassword,
				birthday,
			});
			logger.info('create << End <<');
			res.json(customer);
		} catch (error) {
			logger.error('create :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------------------
	 * @function update
	 * @param req
	 * @param res
	 */
	async update(req: Request, res: Response) {
		logger.info('update >> Start >>');
		// Update a specific records
		const { id } = req.params;
		const { name, email, phone, password, birthday } = req.body;

		const hashedPassword = bcrypt.hashSync(password, 10);
		try {
			const customerExists = await CustomersRepositoryFunction.findById(id);
			const requiredFields = verifyRequiredFields({ name, email });

			if (!customerExists) {
				return res
					.status(StatusCode.NOT_FOUND)
					.json({ error: 'customer not found' });
			}
			if (requiredFields.length > 0) {
				logger.error('update :: Error :: ', mandatoryFieldsRequired.message);
				logger.debug('update :: Error :: Fields ', requiredFields);
				return res
					.status(StatusCode.BAD_REQUEST)
					.json({ error: mandatoryFieldsRequired, fields: requiredFields });
			}
			const customerByEmail =
				await CustomersRepositoryFunction.findByEmail(email);
			if (customerByEmail && customerByEmail._id != id) {
				logger.error('update :: Error :: ', emailAlreadyExists.message);
				logger.debug('update :: Error :: Email :', email);
				return res.status(StatusCode.BAD_REQUEST).json(emailAlreadyExists);
			}

			const customer = await CustomersRepositoryFunction.update(id, {
				name,
				email,
				phone,
				password: hashedPassword,
				birthday,
			});

			logger.info('update << End <<');
			res.json(customer);
		} catch (error) {
			logger.error('update :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------------------
	 * @function delete
	 * @param req
	 * @param res
	 */
	async delete(req: Request, res: Response) {
		logger.info('delete >> Start >>');
		// Delete a specific records
		const { id } = req.params;
		try {
			const customer = await CustomersRepositoryFunction.findById(id);

			if (!customer) {
				return res.status(StatusCode.BAD_REQUEST).json(customerNotFound);
			}
			await CustomersRepositoryFunction.delete(id);
			logger.info('delete << End <<');
			res.sendStatus(StatusCode.NO_CONTENT);
		} catch (error) {
			logger.error('delete :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ------------------------------------------------------------------------------
	 * @function authenticatedRoute
	 * @param req
	 * @param res
	 */
	async authenticatedRoute(req: Request, res: Response) {
		res.json({
			statusCode: StatusCode.SUCCESS,
			message: 'Authenticated',
		});
	}
}
