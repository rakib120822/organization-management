export interface ICreateOrganization {
	name: string;
	description?: string;
}

export interface IUpdateOrganization {
	name?: string;
	description?: string;
}
