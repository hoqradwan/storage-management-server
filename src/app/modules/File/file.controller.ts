import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { deleteFileFromDB, duplicateFileInDB, getAllFilesFromDB, getFilesByDateFromDB, getRecentFilesFromDB, getStorageSummaryFromDB, renameFileInDB, toggleFavoriteInDB, uploadFileIntoDB } from './file.service';

export const getAllFiles = catchAsync(async (req: Request, res: Response) => {
    const result = await getAllFilesFromDB(req.user.id, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Files retrieved successfully!',
        data: result,
    });
});
export const uploadFile = catchAsync(async (req: Request, res: Response) => {
    const result = await uploadFileIntoDB(req, res);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File uploaded successfully!',
        data: result,
    });
});

export const deleteFile = catchAsync(async (req: Request, res: Response) => {
    const result = await deleteFileFromDB(req.user.id, req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File deleted successfully!',
        data: result,
    });
});

export const renameFile = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = await renameFileInDB(req.user.id, req.params.id, name);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File renamed successfully!',
        data: result,
    });
});

export const duplicateFile = catchAsync(async (req: Request, res: Response) => {
    const result = await duplicateFileInDB(req.user.id, req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File duplicated successfully!',
        data: result,
    });
});

export const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
    const result = await toggleFavoriteInDB(req.user.id, req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File favorite status updated',
        data: result,
    });
});

export const getStorageSummary = catchAsync(async (req: Request, res: Response) => {
    const result = await getStorageSummaryFromDB(req.user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Storage summary retrieved!',
        data: result,
    });
});

export const getRecentFiles = catchAsync(async (req: Request, res: Response) => {
    const result = await getRecentFilesFromDB(req.user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Recent files retrieved successfully',
        data: result,
    });
});

export const getFilesByDate = catchAsync(async (req: Request, res: Response) => {
    const date = req.query.date as string;
    const result = await getFilesByDateFromDB(req.user.id, date);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Files retrieved by date successfully',
        data: result,
    });
});