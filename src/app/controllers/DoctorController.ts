import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { DoctorsRepository } from '../repositories/DoctorsRepository';
import {
	emailAlreadyExists,
	generalServerError,
	mandatoryFieldsRequired,
} from '../utils/errors';
import logger from '../utils/logger';
import { StatusCode } from '../utils/statusCodes';
import { verifyRequiredFields } from '../utils/validations';

const DoctorsRepositoryFunction = new DoctorsRepository();

export class DoctorController {
	async login(req: Request, res: Response) {
		const { email, password } = req.body;

		try {
			const doctor = await DoctorsRepositoryFunction.findByEmail(email);

			if (!doctor) {
				return res
					.status(StatusCode.UNAUTHORIZED)
					.json({ error: 'Email ou senha inválidos' });
			}

			const isPasswordValid = await bcrypt.compare(password, doctor.password);

			if (!isPasswordValid) {
				return res
					.status(StatusCode.UNAUTHORIZED)
					.json({ error: 'Email ou senha inválidos' });
			}

			const token = jwt.sign(
				{ doctorId: doctor._id },
				process.env.JWT_SECRET || 'defaultSecret',
				{ expiresIn: '7d' },
			);

			res.status(StatusCode.SUCCESS).json(token);
		} catch (error) {
			console.error(error);
			res
				.status(StatusCode.INTERNAL_SERVER_ERROR)
				.json({ error: 'Erro ao realizar login' });
		}
	}

	async createDoctor(req: Request, res: Response) {
		logger.info('createDoctor >> Start');

		// Extraindo dados do corpo da requisição
		const { name, email, phone, password } = req.body;

		// Verificando campos obrigatórios
		const requiredFields = verifyRequiredFields({ name, email, password });

		try {
			// Validar os campos obrigatórios
			if (requiredFields.length > 0) {
				logger.error(
					'createDoctor :: Error :: ',
					mandatoryFieldsRequired.message,
				);
				logger.debug(
					'createDoctor :: Error :: Missing Fields: ',
					requiredFields,
				);
				return res
					.status(StatusCode.BAD_REQUEST)
					.json({ error: mandatoryFieldsRequired, fields: requiredFields });
			}

			const doctorExists = await DoctorsRepositoryFunction.findByEmail(email);
			if (doctorExists) {
				logger.error('createDoctor :: Error :: ', emailAlreadyExists.message);
				logger.debug('createDoctor :: Error :: Email: ', email);
				return res.status(StatusCode.BAD_REQUEST).json(emailAlreadyExists);
			}

			// Gerar hash da senha
			const hashedPassword = bcrypt.hashSync(password, 10);

			// Configurar o cliente com valores padrão
			const newDoctor = {
				name,
				email,
				phone,
				password: hashedPassword,
			};

			// Criar o cliente
			const doctor = await DoctorsRepositoryFunction.createDoctor(newDoctor);

			logger.info('createDoctor << End');
			return res.status(StatusCode.CREATED).json(doctor);
		} catch (error) {
			logger.error('createDoctor :: Error :: ', error);
			return res
				.status(StatusCode.INTERNAL_SERVER_ERROR)
				.json(generalServerError);
		}
	}
}
