import status from "http-status";
import { auth } from "../../lib/auth";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRegistermemberPayload } from "./auth.interface";

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
console.log(data.user.id)
    
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

export const AuthService = {
  registerMember,
};
