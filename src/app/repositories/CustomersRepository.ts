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
}

export class CustomersRepository {
	// TODO: include the Type of return inside Promise returned from functions
	async findAll(orderBy?: string): Promise<any> {
		const direction = orderBy?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

		return Customer.find({}).sort({ _id: direction.toLowerCase() as any });
	}

	async findAllBirthdays(): Promise<any> {
		return Customer.find({});
	}

	async findById(id: string): Promise<any> {
		return Customer.findOne({ _id: id });
	}

	async findByEmail(email: string): Promise<any> {
		return Customer.findOne({ email }).then((user) => user);
	}

	async createPatient({
		name,
		email,
		phone,
		password,
		birthday,
	}: ICustomer): Promise<any> {
		return Customer.create({ name, email, phone, password, birthday });
	}

	// TODO: remove the validation, and the two step database update (find and save) have to be implemented separately
	// TODO: also delegates the error handling to controller
	async update(
		id: string,
		{ name, email, phone, password, birthday }: ICustomer,
	): Promise<any> {
		const updatedUser = await Customer.findOneAndUpdate(
			{ _id: id },
			{
				name,
				email,
				phone,
				password,
				birthday,
			},
			{ new: true },
		);

		return updatedUser;
	}

	async delete(id: string): Promise<any> {
		return Customer.findOneAndDelete({ _id: id });
	}
}
