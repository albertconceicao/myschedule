import fs from 'fs';

import mongoose from 'mongoose';
import xlsx from 'xlsx';

const Customer = mongoose.model('customers');

// Função para traduzir tipo de pagamento
const translatePaymentType = (payment: string): 'monthly' | 'per_session' => {
	if (payment === 'Mensal') return 'monthly';
	if (payment === 'Por sessão') return 'per_session';
	throw new Error(`Tipo de pagamento inválido: ${payment}`);
};

// Processamento do arquivo
export const importCustomers = async (filePath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(filePath);

		const chunks: Buffer[] = [];
		readStream.on('data', (chunk) => chunks.push(chunk));
		readStream.on('end', async () => {
			try {
				const buffer = Buffer.concat(chunks);
				const workbook = xlsx.read(buffer, { type: 'buffer' });
				const sheetName = workbook.SheetNames[0];
				const sheet = workbook.Sheets[sheetName];
				const jsonData = xlsx.utils.sheet_to_json(sheet);

				// Processar cada linha
				const customers = jsonData.map((row: any) => ({
					name: row.Nome,
					email: row.Email,
					phone: row.Telefone,
					birthday: row.DataNascimento ? new Date(row.DataNascimento) : null,
					paymentType: translatePaymentType(row.TipoPagamento),
					sessionRate: row.ValorSessao || 0,
					monthlyRate: row.ValorMensal || 0,
					balanceDue: row.SaldoDevedor || 0,
				}));

				// Salvar no banco usando streams
				const writeStream = new mongoose.mongo.BulkWriteStream();
				customers.forEach((customer) => {
					writeStream.write({ insertOne: { document: customer } });
				});

				await writeStream.close();
				resolve();
			} catch (error) {
				reject(error);
			}
		});

		readStream.on('error', reject);
	});
