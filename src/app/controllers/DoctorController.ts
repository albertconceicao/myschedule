import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import Doctor from '../models/Doctor';
import { StatusCode } from '../utils/statusCodes';

export class DoctorController {
	async login(req: Request, res: Response) {
		const { email, password } = req.body;

		try {
			const doctor = await Doctor.findOne({ email });

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

			res.status(StatusCode.SUCCESS).json({ token });
		} catch (error) {
			console.error(error);
			res
				.status(StatusCode.INTERNAL_SERVER_ERROR)
				.json({ error: 'Erro ao realizar login' });
		}
	}
}
