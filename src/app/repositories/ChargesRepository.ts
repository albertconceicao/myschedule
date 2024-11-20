// src/repositories/ChargesRepository.ts
import mongoose from 'mongoose';
import '../models/Charge';

const Charge = mongoose.model('Charge');

interface ICharge {
	id?: string;
	customerId: string;
	amount: number;
	chargeType: 'monthly' | 'per_session';
	dueDate: Date;
	status?: 'pending' | 'paid' | 'overdue';
}

export class ChargesRepository {
	async create(charge: ICharge): Promise<any> {
		return Charge.create(charge);
	}

	async findByCustomerId(customerId: string): Promise<any> {
		return Charge.find({ customerId }).sort({ dueDate: 'asc' });
	}

	async updateStatus(id: string, status: 'paid' | 'overdue'): Promise<any> {
		return Charge.findOneAndUpdate({ _id: id }, { status }, { new: true });
	}

	async findPendingByCustomerId(customerId: string): Promise<any> {
		return Charge.find({ customerId, status: 'pending' }).sort({
			dueDate: 'asc',
		});
	}

	async delete(id: string): Promise<any> {
		return Charge.findOneAndDelete({ _id: id });
	}
}
