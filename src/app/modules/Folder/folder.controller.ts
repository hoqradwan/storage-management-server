import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { getAllFoldersFromDB, addFilesToFolderService, createFolderIntoDB, deleteFolderService, getFolderFilesService } from "./folder.service";

export const getAllFolders = catchAsync(async (req, res) => {
    const result = await getAllFoldersFromDB(req.user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Folders retrieved successfully',
        data: result,
    });
})
export const createFolder = catchAsync(async (req, res) => {
    const result = await createFolderIntoDB(req.user.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Folder created successfully',
        data: result,
    });
})

export const addFilesToFolder = catchAsync(async (req, res) => {
    const result = await addFilesToFolderService(
        req.user.id,
        req.params.id,
        req.body.fileIds,
        req.body.password
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Files added to folder',
        data: result
    });
});

export const getFolderFiles = catchAsync(async (req, res) => {
    const result = await getFolderFilesService(
        req.user.id,
        req.params.id,
        req.body.password
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Folder files retrieved',
        data: result
    });
});

export const deleteFolder = catchAsync(async (req, res) => {
    const result = await deleteFolderService(req.user.id, req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Folder deleted successfully',
        data: result
    });
});