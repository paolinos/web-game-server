import {
  createErrorEmptyResult,
  EmptyObjectResult,
  createSuccessEmptyResult,
} from '../objectResult';
import { UserService } from '../interfaces/user.service.interface';
import { UserQueries } from '../../repositories/user.repository';
import { User } from '../../domain/user';

export class UserBusinessLogic implements UserService {
  constructor(private readonly userRepository: UserQueries) {}

  async searchGame(id: string, email: string): Promise<EmptyObjectResult> {
    try {
      let user = await this.userRepository.getById(id);
      if (user) {
        return createErrorEmptyResult('User already exist');
      }

      user = new User(id, email);

      this.userRepository.add(user);
      //this.userRepository.save(user);

      return createSuccessEmptyResult();
    } catch (error) {
      let errorMsg = error;
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      return createErrorEmptyResult(`Error: ${errorMsg}`);
    }
  }

  async cancelSearchGame(id: string): Promise<EmptyObjectResult> {
    try {
      const success = await this.userRepository.removeById(id);
      return success
        ? createSuccessEmptyResult()
        : createErrorEmptyResult('User not exist');
    } catch (error) {
      let errorMsg = error;
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      return createErrorEmptyResult(`Error: ${errorMsg}`);
    }
  }
}
