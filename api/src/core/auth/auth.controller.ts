import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { TokenDto } from './token.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.ACCEPTED)
    @Get()
    async checkAuthentication(): Promise<void> {
        
        // TODO: check token if not return 403
        const tokenOk = await this.authService.checkToken("some string token");
        if(!tokenOk){
            throw new UnauthorizedException();
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post()
    async signIn(@Body() authDto: AuthDto): Promise<TokenDto> {
        return new TokenDto(await this.authService.signIn(authDto.email));
    }
}
