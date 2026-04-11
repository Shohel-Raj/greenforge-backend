import { Request, Response } from "express";
import { envFile } from "../../config/env";
import { nextRes } from "../../shared/nextRes";
import ms, { StringValue } from "ms";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";



const registerMember = nextRes(
    async (req: Request, res: Response) => {
        const maxAge = ms(envFile.ACCESS_TOKEN_EXPIRES_IN as StringValue);

        const payload = req.body;



        const result = await AuthService.registerMember(payload);

        const { accessToken, refreshToken, token, ...rest } = result

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Member registered successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest,
            }
        })
    }
)

const loginUser = nextRes(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        const { accessToken, refreshToken, token, ...rest } = result

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest,

            },
        })
    }
)
const verifyEmail = nextRes(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        await AuthService.verifyEmail(email, otp);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
        });
    }
)
const getMe = nextRes(
    async (req: Request, res: Response) => {
        const user = req.user;
        const result = await AuthService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result,
        })
    }
)



export const AuthController={
    registerMember,
    loginUser,
    verifyEmail,
    getMe
}