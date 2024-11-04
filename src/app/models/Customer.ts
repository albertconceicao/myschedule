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
	},
	{
		timestamps: true,
	},
);

mongoose.model('customers', Customer);
