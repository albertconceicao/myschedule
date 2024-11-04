import { parse } from 'date-fns';
import { Request, Response } from 'express';

import { AppointmentsRepository } from '../repositories/AppointmentsRepository';
import { generalServerError } from '../utils/errors';
import logger from '../utils/logger';
import { StatusCode } from '../utils/statusCodes';

const AppointmentsRepositoryFunction = new AppointmentsRepository();

export class AppointmentController {
	async list(req: Request, res: Response) {
		logger.info('list >> Start >>');

		try {
			const appointments = await AppointmentsRepositoryFunction.findAll();
			logger.info('list << End <<');
			res.status(StatusCode.FOUND).json(appointments);
		} catch (error) {
			logger.error('list :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ---------------------------------------------------------------------------
	 * @function listByCustomer
	 * @param req
	 * @param res
	 * @description Listar todos os agendamentos de um customer
	 */
	async listByCustomer(req: Request, res: Response) {
		logger.info('listByCustomer >> Start >>');
		const { customerId } = req.params;

		try {
			const appointments =
				await AppointmentsRepositoryFunction.findByCustomerId(customerId);
			logger.info('listByCustomer << End <<');
			res.status(StatusCode.FOUND).json(appointments);
		} catch (error) {
			logger.error('listByCustomer :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	async findById(req: Request, res: Response) {
		logger.info('findById >> Start >>');
		const { appointmentId } = req.params;

		try {
			const appointment =
				await AppointmentsRepositoryFunction.findById(appointmentId);
			logger.info('findById << End <<');
			res.status(StatusCode.FOUND).json(appointment);
		} catch (error) {
			logger.error('findById :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/** ---------------------------------------------------------------------------
	 * @function create
	 * @param req
	 * @param res
	 * @description Criar um novo agendamento para um customer
	 */
	async create(req: Request, res: Response) {
		logger.info('create >> Start >>');
		const { customerId, date, description, notes } = req.body;
		const requiredFields = ['customerId', 'date', 'description'];

		try {
			const missingFields = requiredFields.filter((field) => !req.body[field]);
			if (missingFields.length > 0) {
				logger.error('create :: Error :: Missing fields', missingFields);
				return res.status(StatusCode.BAD_REQUEST).json({
					error: 'Campos obrigatórios estão faltando',
					fields: missingFields,
				});
			}

			const appointment =
				await AppointmentsRepositoryFunction.createAppointment({
					customerId,
					date,
					description,
					notes,
				});

			logger.info('create << End <<');
			res.status(StatusCode.CREATED).json(appointment);
		} catch (error) {
			logger.error('create :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	async update(req: Request, res: Response) {
		logger.info('updateAppointment >> Start >>');
		const { appointmentId, date, description, notes } = req.body;
		const requiredFields = ['appointmentId', 'date', 'description'];
		const formattedDate = parse(date, 'dd/MM/yyyy', new Date());

		try {
			const missingFields = requiredFields.filter((field) => !req.body[field]);
			if (missingFields.length > 0) {
				logger.error(
					'updateAppointment :: Error :: Missing fields',
					missingFields,
				);
				return res.status(StatusCode.BAD_REQUEST).json({
					error: 'Campos obrigatórios estão faltando',
					fields: missingFields,
				});
			}
			const appointment =
				await AppointmentsRepositoryFunction.updateAppointment(appointmentId, {
					date: formattedDate,
					description,
					notes,
				});

			logger.info('updateAppointment << End <<');
			res.status(StatusCode.CREATED).json(appointment);
		} catch (error) {
			logger.error('updateAppointment :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	async delete(req: Request, res: Response) {
		logger.info('deleteAppointment >> Start >>');
		const { appointmentId } = req.params;

		const requiredFields = ['appointmentId'];

		try {
			const missingFields = requiredFields.filter(
				(field) => !req.params[field],
			);
			if (missingFields.length > 0) {
				logger.error('delete :: Error :: Missing fields', missingFields);
				return res.status(StatusCode.BAD_REQUEST).json({
					error: 'Campos obrigatórios estão faltando',
					fields: missingFields,
				});
			}
			await AppointmentsRepositoryFunction.deleteAppointment(appointmentId);
			logger.info('deleteAppointment << End <<');
			res.sendStatus(StatusCode.NO_CONTENT);
		} catch (error) {
			logger.error('deleteAppointment :: Error :: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}
}