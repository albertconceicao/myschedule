import mongoose from 'mongoose';

import { CustomersRepository } from './CustomersRepository';

const Customer = mongoose.model('customers');
const CustomersRepositoryFunction = new CustomersRepository();

describe('CustomersRepository - findAllByDoctorId', () => {
	it('should return customers associated with a specific doctor', async () => {
		const doctorId = 'doctor123';
		const orderBy = 'asc';

		// Simule clientes no banco com doctorId
		await Customer.create([
			{ name: 'John Doe', email: 'test1@test.com', doctorId },
			{ name: 'Jane Smith', email: 'test2@test.com', doctorId },
			{ name: 'Alice Brown', email: 'test3@test.com', doctorId },
		]);

		const customers = await CustomersRepositoryFunction.findAllByDoctorId(
			doctorId,
			orderBy,
		);

		expect(customers).toHaveLength(3);
		expect(customers[0].name).toBe('Alice Brown');
	});
});
