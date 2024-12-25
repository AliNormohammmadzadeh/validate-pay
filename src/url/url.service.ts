import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'nestjs-redis';
import Redis from 'ioredis';
import axios from 'axios';

@Injectable()
export class UrlService implements OnModuleInit {
  private redisClient: Redis;

  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    this.redisClient = this.redisService.getClient();
    const urls = await this.urlRepository.find({ where: { isActive: true } });
    const pipeline = this.redisClient.pipeline();
    urls.forEach((url) => {
      pipeline.set(url.url, 'valid', 'EX', 3600);
    });
    await pipeline.exec();
  }

  async validateUrl(url: string): Promise<boolean> {
    const cached = await this.redisClient.get(url);
    if (cached === 'valid') {
      return true;
    }

    const urlEntity = await this.urlRepository.findOne({ where: { url, isActive: true } });
    if (urlEntity) {
      await this.redisClient.set(url, 'valid', 'EX', 3600)
      return true;
    }

    const isSslValid = await this.checkSsl(url);
    if (isSslValid) {
      await this.urlRepository.save({ url, isActive: true });
      await this.redisClient.set(url, 'valid', 'EX', 3600);
      return true;
    }

    return false;
  }

  private async checkSsl(url: string): Promise<boolean> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const protocol = new URL(url).protocol;
      return protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  async addUrl(url: string): Promise<Url> {
    const newUrl = this.urlRepository.create({ url, isActive: true });
    await this.urlRepository.save(newUrl);
    await this.redisClient.set(url, 'valid', 'EX', 3600);
    return newUrl;
  }
}