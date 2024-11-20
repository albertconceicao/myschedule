// src/jobs/generateMonthlyCharges.ts
import { ChargesRepository } from '../repositories/ChargesRepository';
import { CustomersRepository } from '../repositories/CustomersRepository';

const ChargesRepo = new ChargesRepository();
const CustomersRepo = new CustomersRepository();

export async function generateMonthlyCharges() {
	const customers = await CustomersRepo.findAll();

	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const createChargesPromises = customers
		.filter((customer: any) => customer.paymentType === 'monthly')
		.map((customer: any) =>
			ChargesRepo.create({
				customerId: customer._id,
				amount: customer.monthlyRate,
				chargeType: 'monthly',
				dueDate: startOfMonth,
				status: 'pending',
			}),
		);

	await Promise.all(createChargesPromises);
}
