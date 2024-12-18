import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
	name: string;
	email: string;
	password: string;
	phone?: string;
	customers: mongoose.Schema.Types.ObjectId[];
}

const DoctorSchema = new Schema<IDoctor>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
		},
		customers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Customer',
			},
		],
	},
	{
		timestamps: true,
	},
);

export default mongoose.model<IDoctor>('doctors', DoctorSchema);
