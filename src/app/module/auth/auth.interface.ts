//  name      String
//     email     String     @unique
//     password  String
//     avatarUrl String?
//     createdAt DateTime   @default(now())

export interface registerUser {
	name: string;
	email: string;
	password: string;
	avatarUrl?: string;
}

export interface logInUser {
	email: string;
	password: string;
}

export interface forgetPasswordInput {
	email: string;
}
export interface resetPasswordInput {
	email: string;
	password: string;
	otp: string;
}
