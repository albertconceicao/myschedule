// Connect with Data Source
import mongoose from 'mongoose';
import '../models/Payment';

const Payment = mongoose.model('payments');

interface IPayment {
	id?: string;
	customerId: string;
	appointmentId?: string;
	amount: number;
	paymentType: 'monthly' | 'per_session';
	paymentDate?: Date;
	status?: 'paid' | 'pending' | 'failed';
}

export class PaymentsRepository {
	async findAll(orderBy?: string): Promise<any> {
		const direction = orderBy?.toUpperCase() === 'DESC' ? -1 : 1;
		return Payment.find({}).sort({ paymentDate: direction });
	}

	async findById(id: string): Promise<any> {
		return Payment.findOne({ _id: id });
	}

	async findByCustomerId(customerId: string): Promise<any> {
		return Payment.find({ customerId })
			.populate('customerId appointmentId')
			.sort({ date: 'asc' });
	}

	async create({
		customerId,
		appointmentId,
		amount,
		paymentType,
		paymentDate,
		status = 'pending',
	}: IPayment): Promise<any> {
		return Payment.create({
			customerId,
			appointmentId,
			amount,
			paymentType,
			paymentDate: paymentDate || new Date(),
			status,
		});
	}

	async update(
		id: string,
		{
			customerId,
			appointmentId,
			amount,
			paymentType,
			paymentDate,
			status,
		}: IPayment,
	): Promise<any> {
		return Payment.findOneAndUpdate(
			{ _id: id },
			{
				customerId,
				appointmentId,
				amount,
				paymentType,
				paymentDate,
				status,
			},
			{ new: true },
		);
	}

	/**
	 * @function delete
	 * Delete a payment by its ID
	 */
	async delete(id: string): Promise<any> {
		return Payment.findOneAndDelete({ _id: id });
	}

	/**
	 * @function generateReport
	 * Generate financial reports filtered by customer and/or date range
	 */
	async generateReport(filters: any): Promise<any> {
		return Payment.find(filters).sort({ paymentDate: 'asc' });
	}
}
