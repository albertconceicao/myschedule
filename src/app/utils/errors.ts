// VAL - validation errors
// SEC - for security errors or blocks
// GEN - for general server errors

export const customerNotFound = {
	code: 'ERR-001-VAL',
	message: 'customer not found in the database, please fix it and try again',
	shortMessage: 'customerNotFound',
};

export const mandatoryFieldsRequired = {
	code: 'ERR-002-VAL',
	message: 'mandatory fields required must be provided',
	shortMessage: 'mandatoryFieldsRequired',
};

export const emailAlreadyExists = {
	code: 'ERR-003-VAL',
	message: 'This email was already been taken',
	shortMessage: 'emailAlreadyExists',
};

export const generalServerError = {
	code: 'ERR-004-GEN',
	message: 'General server error',
	shortMessage: 'generalServerError',
};

export const paymentNotFound = {
	code: 'ERR-005-VAL',
	message: 'payment not found in the database, please fix it and try again',
	shortMessage: 'paymentNotFound',
};
