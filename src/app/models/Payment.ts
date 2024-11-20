import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
	customerId: Types.ObjectId;
	appointmentId?: Types.ObjectId;
	amount: number;
	paymentDate: Date;
	paymentType: 'monthly' | 'per_session';
	status: 'paid' | 'pending' | 'failed';
}

const PaymentSchema: Schema = new Schema(
	{
		customerId: {
			type: Schema.Types.ObjectId,
			ref: 'customers',
			required: true,
		},
		appointmentId: {
			type: Schema.Types.ObjectId,
			ref: 'appointments',
			required: false,
		},
		amount: {
			type: Number,
			required: true,
		},
		paymentDate: {
			type: Date,
			default: Date.now,
		},
		paymentType: {
			type: String,
			enum: ['monthly', 'per_session'],
			required: true,
		},
		status: {
			type: String,
			enum: ['paid', 'pending', 'failed'],
			default: 'pending',
		},
		isFullyPaid: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model<IPayment>('payments', PaymentSchema);
