import mongoose from 'mongoose';

import '../models/Doctor';

const Doctor = mongoose.model('doctors');

export class DoctorsRepository {
	async findAll(orderBy?: string): Promise<any> {
		const direction = orderBy?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

		return Doctor.find({}).sort({ _id: direction.toLowerCase() as any });
	}

	async findById(id: string): Promise<any> {
		return Doctor.findOne({ _id: id });
	}

	async findByEmail(email: string): Promise<any> {
		return Doctor.findOne({ email }).then((user) => user);
	}

	async createDoctor({
		name,
		email,
		password,
		phone,
	}: {
		name: string;
		email: string;
		password: string;
		phone: string;
	}): Promise<any> {
		return Doctor.create({ name, email, password, phone });
	}
}
