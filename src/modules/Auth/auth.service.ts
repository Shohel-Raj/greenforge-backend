import status from "http-status";
import { auth } from "../../lib/auth";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegistermemberPayload } from "./auth.interface";
import { UserStatus } from "../../generated/prisma/enums";

const registerMember = async (payload: IRegistermemberPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {

    throw new AppError(status.BAD_REQUEST, "Failed to register member");
  }


  try {
    const member = await prisma.$transaction(async (tx) => {
      const memberTx = await tx.member.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });

      return memberTx;
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
      member,
    };
  } catch (error) {
    console.log("Transaction error : ", error);
    
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is blocked");
    }

    if (data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        emailVerified: data.user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };

}
const verifyEmail = async (email : string, otp : string) => {

    const result = await auth.api.verifyEmailOTP({
        body:{
            email,
            otp,
        }
    })

    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where : {
                email,
            },
            data : {
                emailVerified: true,
            }
        })
    }
}
export const AuthService = {
  registerMember,
  loginUser,
  verifyEmail
};
