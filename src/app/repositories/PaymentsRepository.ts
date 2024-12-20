// Connect with Data Source
import mongoose from 'mongoose';

import '../models/Customer';
import '../models/Payment';
import { ChargesRepository } from './ChargesRepository';

const ChargesRepositoryFunction = new ChargesRepository();
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

	async create(payment: IPayment): Promise<any> {
		const { customerId, amount, paymentType } = payment;

		// Localizar cobrança pendente correspondente
		const pendingCharges =
			await ChargesRepositoryFunction.findPendingByCustomerId(customerId);

		if (pendingCharges.length > 0) {
			const matchedCharge = pendingCharges.find(
				(charge: any) =>
					charge.amount === amount && charge.chargeType === paymentType,
			);
			if (matchedCharge) {
				// Atualiza o status da cobrança para 'paid'
				await ChargesRepositoryFunction.updateStatus(matchedCharge.id, 'paid');
			}
		}

		// Cria o pagamento
		return Payment.create(payment);
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
		return Payment.find(filters)
			.populate('customerId appointmentId')
			.sort({ paymentDate: 'asc' });
	}
}
