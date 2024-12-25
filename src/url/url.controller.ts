import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { UrlService } from "./url.service";
import { ValidateUrlDto } from "./dto/validate-url.dto";
import { ThrottlerGuard } from "@nestjs/throttler";


@Controller('validate')
@UseGuards(ThrottlerGuard)
export class UrlController {
    constructor(private readonly urlService: UrlService){}

    @Post()
    async validateUrl(@Body() validateUrlDto:ValidateUrlDto) {
        const { url } = validateUrlDto
        const isValid = await this.urlService.validateUrl(url)
        if(isValid){
            return { valid : true}
        }else {
            throw new HttpException("Invalid or Unverified URL" , HttpStatus.BAD_REQUEST)
        }
    }

    @Post('add')
    async addUrl(@Body() validateUrlDto:ValidateUrlDto){
        const { url } = validateUrlDto
        const newUrl = await this.urlService.addUrl(url)
        return { id: newUrl.id , url: newUrl.url}
    }
}