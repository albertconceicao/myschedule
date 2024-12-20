import mongoose, { Schema } from 'mongoose';

const Customer: any = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: false,
		},
		phone: {
			type: String,
			required: false,
		},
		birthday: {
			type: Date,
			required: false,
		},
		paymentType: {
			type: String,
			enum: ['per_session', 'monthly'],
			default: 'per_session',
		},
		sessionRate: {
			type: Number,
			default: 0,
		},
		monthlyRate: {
			type: Number,
			default: 0,
		},
		balanceDue: {
			type: Number,
			default: 0,
		},
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'doctors',
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

mongoose.model('customers', Customer);
