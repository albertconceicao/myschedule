// src/models/Charge.ts
import mongoose from 'mongoose';

const ChargeSchema = new mongoose.Schema({
	customerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Customer',
		required: true,
	},
	amount: { type: Number, required: true },
	chargeType: {
		type: String,
		enum: ['monthly', 'per_session'],
		required: true,
	},
	dueDate: { type: Date, required: true },
	status: {
		type: String,
		enum: ['pending', 'paid', 'overdue'],
		default: 'pending',
	},
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Charge', ChargeSchema);
