import "reflect-metadata";
import { Container } from "inversify";
import { IOC_TYPES } from "./ioc.types";
import { IDBContext, LocalContext } from "./infrastructure/db/db.context";
import {
	IUserRepository,
	UserRepository,
} from "./infrastructure/db/user.repository";
import { AuthBusiness, IAuthBusiness } from "./core/business/auth.business";

const iocContainer = new Container();
iocContainer
	.bind<IDBContext>(IOC_TYPES.DBContext)
	.to(LocalContext)
	.inSingletonScope();
iocContainer.bind<IUserRepository>(IOC_TYPES.UserRepository).to(UserRepository);
iocContainer.bind<IAuthBusiness>(IOC_TYPES.AuthBusiness).to(AuthBusiness);

export default iocContainer;
