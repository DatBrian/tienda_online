import { Response } from "express";

const resError = (res: Response, status: number, message: string) => {
    res.status(status).json({
        error: true,
        message,
    });
};
export default resError;