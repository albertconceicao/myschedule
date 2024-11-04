import mongoose, { Schema } from 'mongoose';

const Appointment: any = new Schema(
	{
		customerId: {
			type: Schema.Types.ObjectId,
			ref: 'customers', // Nome da collection Customer
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		notes: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

mongoose.model('appointments', Appointment);
