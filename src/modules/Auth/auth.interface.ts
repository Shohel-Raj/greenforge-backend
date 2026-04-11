import { Role } from "../../generated/prisma/enums";

export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegistermemberPayload {
    name: string;
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface IRequestUser{
    userId : string;
    role : Role;
    email : string;
}