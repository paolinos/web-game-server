import { ApiProperty } from '@nestjs/swagger';

export class AuthDto{
    @ApiProperty()
    public email: string;
}