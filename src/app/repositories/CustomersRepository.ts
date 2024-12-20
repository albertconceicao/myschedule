// Connect with Data Source
import mongoose from 'mongoose';

import '../models/Customer';

const Customer = mongoose.model('customers');

interface ICustomer {
	id?: string;
	name: string;
	email: string;
	phone: string;
	password?: string;
	birthday?: Date;
	paymentType?: 'per_session' | 'monthly';
	sessionRate?: Number;
	monthlyRate?: Number;
	balanceDue?: Number;
	doctorId?: string;
}

export class CustomersRepository {
	// TODO: include the Type of return inside Promise returned from functions
	async findAll(orderBy?: string): Promise<any> {
		const direction = orderBy?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

		return Customer.find({}).sort({ _id: direction.toLowerCase() as any });
	}

	async findAllByDoctorId(doctorId: string, orderBy?: string): Promise<any> {
		const direction = orderBy?.toUpperCase() === 'DESC' ? -1 : 1;

		return Customer.find({ doctorId }).sort({ name: direction });
	}

	async findAllBirthdays(): Promise<any> {
		return Customer.find({}, 'name birthday').sort({ name: 'asc' });
	}

	async findById(id: string): Promise<any> {
		return Customer.findOne({ _id: id });
	}

	async findByEmail(email: string): Promise<any> {
		return Customer.findOne({ email }).then((user) => user);
	}

	async findByEmails(emails: string[]): Promise<any> {
		return Customer.find({ email: { $in: emails } }).exec();
	}

	async createPatient({
		name,
		email,
		phone,
		birthday,
		paymentType,
		sessionRate,
		monthlyRate,
		balanceDue,
		doctorId,
	}: ICustomer): Promise<any> {
		return Customer.create({
			name,
			email,
			phone,
			birthday,
			paymentType,
			sessionRate,
			monthlyRate,
			balanceDue,
			doctorId,
		});
	}

	// TODO: remove the validation, and the two step database update (find and save) have to be implemented separately
	async update(
		id: string,
		{ name, email, phone, password }: ICustomer,
	): Promise<any> {
		const updatedUser = await Customer.findOneAndUpdate(
			{ _id: id },
			{
				name,
				email,
				phone,
				password,
			},
			{ new: true },
		);

		return updatedUser;
	}

	async updateBalance(customerId: string, amount: number): Promise<any> {
		return Customer.findByIdAndUpdate(
			customerId,
			{ $inc: { balanceDue: amount } },
			{ new: true },
		);
	}

	async delete(id: string): Promise<any> {
		return Customer.findOneAndDelete({ _id: id });
	}

	async bulkInsert(customers: any[]): Promise<void> {
		await Customer.insertMany(customers);
	}
}
