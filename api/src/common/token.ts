import { sign, verify } from "jsonwebtoken";
import config from "../config";

const JWT_ISSUER = "app";

/**
 * Generate token from object
 * @param data object to encrypt into jwt
 * @returns string
 */
export const generateToken = <T extends object>(data: T): string => {
	return sign(data, config.jwt_secret, { expiresIn: "8h", issuer: JWT_ISSUER });
};

/**
 * Verify Token
 * @param token string
 * @param ignoreExpiration (optional) default false
 * @returns object or null
 */
export const verifyToken = <T extends object>(
	token: string,
	ignoreExpiration: boolean = false,
): T | null => {
	try {
		const result: any = verify(token, config.jwt_secret, {
			issuer: JWT_ISSUER,
			ignoreExpiration,
		});
		if (result) {
			return result;
		}
	} catch (error) {
		// NOTE: log in console
		console.warn(`parseToken invalid. token : ${token} => `, error);
	}
	return null;
};
