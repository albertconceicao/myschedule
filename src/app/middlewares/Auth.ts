import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	console.log({ authHeader });
	if (!authHeader) {
		return res
			.status(401)
			.json({ error: 'Acesso negado. Token não fornecido.' });
	}

	const token = authHeader.split(' ')[1];
	console.log({ token });
	try {
		const decoded: any = jwt.verify(
			token,
			process.env.JWT_SECRET || 'defaultSecret',
		);

		req.body.doctorId = decoded.doctor._id;
		next();
	} catch (error) {
		res.status(403).json({ error: 'Token inválido ou expirado' });
	}
}
