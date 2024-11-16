export type UserModel = {
	email: string;
	password: string;
	lastAccess: Date;
	token?: string;
};
