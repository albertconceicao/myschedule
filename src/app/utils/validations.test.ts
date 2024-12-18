/* eslint-disable no-undef */
import { verifyRequiredFields } from './validations';

describe('verifyRequiredFields', () => {
	it('should return an array with age and email values inside', () => {
		const input = {
			name: 'John',
			age: undefined,
			email: null,
		};

		const result = verifyRequiredFields(input);

		expect(result).toEqual(['age', 'email']);
	});

	it('should return an array with email value inside', () => {
		const input = {
			name: 'John',
			age: 23,
			email: null,
		};

		const result = verifyRequiredFields(input);

		expect(result).toEqual(['email']);
	});

	it('should return an empty array if all fields are present', () => {
		const input = {
			name: 'John',
			age: 23,
			email: 'test@test.com',
		};

		const result = verifyRequiredFields(input);

		expect(result).toEqual([]);
	});

	it('should return all fields names if all fields are undefined or null', () => {
		const input = {
			name: undefined,
			age: null,
			email: null,
		};

		const result = verifyRequiredFields(input);

		expect(result).toEqual(['name', 'age', 'email']);
	});

	it('should not consider fields with falsy value, but, different for undefined or null', () => {
		const input = {
			name: '',
			age: 0,
			email: false,
		};

		const result = verifyRequiredFields(input);

		expect(result).toEqual([]);
	});
});
