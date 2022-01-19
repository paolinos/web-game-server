import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { TokenDto } from './token.dto';
import { AuthGuardButContinue } from '../../common/auth/auth.guard';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiBearerAuth()
	@UseGuards(AuthGuardButContinue)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get()
    async checkAuthentication(@Request() req): Promise<void> {
        
        let tokenOk = false;
        if(req.scope && req.scope.token){
            tokenOk = await this.authService.checkToken(req.scope.token);
        }

        if(!tokenOk){
            throw new UnauthorizedException();
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post()
    async signIn(@Body() authDto: AuthDto): Promise<TokenDto> {
        if(!authDto.hasOwnProperty("email")){
            throw new BadRequestException();
        }

        const token = await this.authService.signIn(authDto.email);
        return new TokenDto(token);
    }
}
