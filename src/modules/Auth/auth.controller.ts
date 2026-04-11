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



export const AuthController={
    registerMember,
}