import { Router } from 'express';
// import { AdminRoutes } from '../modules/Admin/admin.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { FileRoutes } from '../modules/File/file.route';
import { FolderRoutes } from '../modules/Folder/folder.route';


const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/file',
    route: FileRoutes,
  },
  {
    path: '/folder',
    route: FolderRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
