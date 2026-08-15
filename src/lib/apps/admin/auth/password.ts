import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
			if (err) reject(err);
			else resolve(derivedKey);
		});
	});
}

/** Hashes a plaintext password into a `salt:hash` hex-encoded string. */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const derivedKey = await scryptAsync(password, salt);
	return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

/** Verifies a plaintext password against a `salt:hash` string from hashPassword. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [saltHex, hashHex] = stored.split(':');
	if (!saltHex || !hashHex) return false;

	const salt = Buffer.from(saltHex, 'hex');
	const expected = Buffer.from(hashHex, 'hex');
	const actual = await scryptAsync(password, salt);

	if (actual.length !== expected.length) return false;
	return timingSafeEqual(actual, expected);
}
