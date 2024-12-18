import fs from 'fs/promises';

import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import xlsx from 'xlsx';

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
			// Extrair o doctorId do middleware de autenticação
			const { doctorId } = req.body;

			// Validar se o doctorId foi fornecido
			if (!doctorId) {
				logger.error('list :: Error :: Doctor ID is missing');
				return res.status(StatusCode.UNAUTHORIZED).json({
					error: 'Doctor ID não fornecido. Verifique sua autenticação.',
				});
			}

			// Buscar apenas os clientes associados ao médico autenticado
			const customers = await CustomersRepositoryFunction.findAllByDoctorId(
				doctorId,
				orderBy,
			);

			// Verificar se há clientes para o médico
			if (customers.length === 0) {
				logger.info('list :: No customers found for the doctor');
				return res.status(StatusCode.NOT_FOUND).json({
					message: 'Nenhum cliente encontrado para este médico.',
				});
			}

			logger.info('list << End <<');
			return res.status(StatusCode.FOUND).json(customers);
		} catch (error) {
			logger.error('list :: Error :: ', error);
			return res
				.status(StatusCode.INTERNAL_SERVER_ERROR)
				.json(generalServerError);
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
			logger.error('find :: Error General:: ', error);
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generalServerError);
		}
	}

	/**
	 * @function listAllBirthdays
	 * @param req
	 * @param res
	 */
	async listAllBirthdays(req: Request, res: Response) {
		logger.info('listAllBirthdays >> Start >>');
		try {
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
		logger.info('createPatient >> Start');

		// Extraindo dados do corpo da requisição
		const {
			name,
			email,
			phone,
			password,
			birthday,
			paymentType,
			sessionRate,
			monthlyRate,
		} = req.body;

		// Extraindo o doctorId injetado pelo middleware de autenticação
		const { doctorId } = req.body;

		// Verificando campos obrigatórios
		const requiredFields = verifyRequiredFields({ name, email, password });

		try {
			// Validar os campos obrigatórios
			if (requiredFields.length > 0) {
				logger.error(
					'createPatient :: Error :: ',
					mandatoryFieldsRequired.message,
				);
				logger.debug(
					'createPatient :: Error :: Missing Fields: ',
					requiredFields,
				);
				return res
					.status(StatusCode.BAD_REQUEST)
					.json({ error: mandatoryFieldsRequired, fields: requiredFields });
			}

			// Validar a existência do médico (opcional, para maior segurança)
			const doctorExists =
				await CustomersRepositoryFunction.findAllByDoctorId(doctorId);
			if (!doctorExists) {
				logger.error('createPatient :: Error :: Doctor not found');
				return res.status(StatusCode.UNAUTHORIZED).json({
					error: 'Médico não encontrado. Verifique sua autenticação.',
				});
			}

			// Verificar se o cliente já existe
			const customerExists =
				await CustomersRepositoryFunction.findByEmail(email);
			if (customerExists) {
				logger.error('createPatient :: Error :: ', emailAlreadyExists.message);
				logger.debug('createPatient :: Error :: Email: ', email);
				return res.status(StatusCode.BAD_REQUEST).json(emailAlreadyExists);
			}

			// Gerar hash da senha
			const hashedPassword = bcrypt.hashSync(password, 10);

			// Configurar o cliente com valores padrão
			const newCustomer = {
				name,
				email,
				phone,
				password: hashedPassword,
				birthday,
				paymentType: paymentType || 'per_session', // Default para 'per_session'
				sessionRate: sessionRate || 0, // Default para 0
				monthlyRate: monthlyRate || 0, // Default para 0
				balanceDue: 0.0, // Default para 0
				doctorId, // Associar o cliente ao médico autenticado
			};

			// Criar o cliente
			const customer =
				await CustomersRepositoryFunction.createPatient(newCustomer);

			logger.info('createPatient << End');
			return res.status(StatusCode.CREATED).json(customer);
		} catch (error) {
			logger.error('createPatient :: Error :: ', error);
			return res
				.status(StatusCode.INTERNAL_SERVER_ERROR)
				.json(generalServerError);
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
		const {
			name,
			email,
			phone,
			password,
			birthday,
			paymentType,
			sessionRate,
			monthlyRate,
		} = req.body;

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
				paymentType: paymentType || 'per_session', // Default to 'per_session'
				sessionRate: sessionRate || 0, // Default to 0 if not provided
				monthlyRate: monthlyRate || 0, // Default to 0 if not provided
				balanceDue: 0,
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

	/** ------------------------------------------------------------------------------
	 * @function importCustomers
	 * @param req
	 * @param res
	 */
	async importCustomers(req: Request, res: Response): Promise<Response> {
		try {
			logger.info('bulk >> Start >>');
			const filePath = req.file?.path;

			if (!filePath) {
				return res.status(400).send({ error: 'Nenhum arquivo enviado.' });
			}

			// Ler o arquivo
			const fileBuffer = await fs.readFile(filePath);
			const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);

			// Extrair todos os e-mails da planilha
			const emailsFromSheet = jsonData.map((row: any) => row.Email);

			// Buscar e-mails já existentes no banco em uma única consulta
			const existingCustomers =
				await CustomersRepositoryFunction.findByEmails(emailsFromSheet);
			const existingEmails = new Set(
				existingCustomers.map((c: any) => c.email),
			);

			// Filtrar clientes que já existem no banco
			const customersToInsert = jsonData
				.filter((row: any) => !existingEmails.has(row.Email))
				.map((row: any) => ({
					name: row.Nome,
					email: row.Email,
					phone: row.Telefone,
					birthday: row.DataNascimento ? new Date(row.DataNascimento) : null,
					paymentType:
						row.TipoPagamento === 'Mensal' ? 'monthly' : 'per_session',
					sessionRate: row.ValorSessao || 0,
					monthlyRate: row.ValorMensal || 0,
					balanceDue: row.SaldoDevedor || 0,
				}));

			// Inserir novos clientes no banco
			if (customersToInsert.length > 0) {
				await CustomersRepositoryFunction.bulkInsert(customersToInsert);
			}

			// Remover o arquivo após processar
			await fs.unlink(filePath);

			logger.info('bulk << End <<');
			return res.status(200).send({
				message: `Clientes importados com sucesso! ${customersToInsert.length} clientes adicionados.`,
			});
		} catch (error) {
			console.error(error);
			logger.error('bulk :: Error :: ', error);
			return res.status(500).send({ error: 'Erro ao importar clientes.' });
		}
	}
}
