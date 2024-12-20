// Connect with Data Source
import mongoose from 'mongoose';

import '../models/Appointment';

const Appointment = mongoose.model('appointments');

interface IAppointment {
	customerId?: string;
	doctorId?: string;
	date: Date;
	description: string;
	notes?: string;
	amount?: number;
}

export class AppointmentsRepository {
	async findAll() {
		return Appointment.find({}).populate('customerId').sort({ date: 'asc' });
	}

	async findAllByDoctorId(doctorId: string, orderBy?: string): Promise<any> {
		const direction = orderBy?.toUpperCase() === 'DESC' ? -1 : 1;

		return Appointment.find({ doctorId })
			.sort({ name: direction })
			.populate('customerId')
			.sort({ date: 'asc' });
	}

	async findById(id: string): Promise<any> {
		return Appointment.findById(id);
	}

	async findByCustomerId(customerId: string): Promise<any> {
		return Appointment.find({ customerId }).sort({ date: 'asc' });
	}

	async createAppointment(appointmentData: IAppointment): Promise<any> {
		return Appointment.create(appointmentData);
	}

	async updateAppointment(
		appointmentId: string,
		appointmentData: IAppointment,
	): Promise<any> {
		return Appointment.findOneAndUpdate(
			{ _id: appointmentId },
			{
				date: appointmentData.date,
				description: appointmentData.description,
				notes: appointmentData.notes,
			},
			{ new: true },
		);
	}

	async deleteAppointment(id: string): Promise<any> {
		return Appointment.findOneAndDelete({ _id: id });
	}
}
