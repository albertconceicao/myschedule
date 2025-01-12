import mongoose, { Schema } from 'mongoose';

const User: any = new Schema(
	{
		id: mongoose.Schema.Types.ObjectId,
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
		created_at: {
			type: Date,
			default: new Date(),
		},
	},
	{
		timestamps: true,
	},
);

mongoose.model('customers', User);
