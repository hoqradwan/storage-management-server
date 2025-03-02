import { z } from 'zod';

const createFolderSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Folder name is required',
            invalid_type_error: 'Folder name must be a string'
        }).min(1).max(50),
        type: z.enum(['normal', 'private'], {
            required_error: 'Folder type is required (normal/private)',
            invalid_type_error: 'Folder type must be either normal or private'
        }),
        password: z.string().optional()
    }).refine(data => {
        if (data.type === 'private' && !data.password) {
            throw new Error('Password is required for private folders');
        }
        if (data.type === 'normal' && data.password) {
            throw new Error('Password not allowed for normal folders');
        }
        return true;
    })
});
// In folder.validation.ts
const addFilesValidationSchema = z.object({
    body: z.object({
        fileIds: z.array(z.string()).min(1),
        password: z.string().optional()
    })
});
export const FolderValidations = {
    createFolderSchema,
    addFilesValidationSchema
};