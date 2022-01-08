import { MatchStatus } from '../../domain/match';
import { UserDto } from './user.dto';

export class MatchDto
{
    public id:string;

    public users:UserDto[] = [];

    public status:MatchStatus = MatchStatus.STAND_BY;
}