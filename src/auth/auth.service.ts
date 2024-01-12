/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create_user.dto';

class Utils {
  static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  static hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }
}
@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(User)
    // private userRepository: Repository<User>,
    // data source
    @Inject('DATA_SOURCE') private sqlDb: DataSource,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginUserDto) {
    const userSql: User[] = await this.sqlDb.query(
      `SELECT * FROM users WHERE email = '${loginDto.email}' LIMIT 1 `,
    );
    if (userSql.length === 0) {
      throw new NotFoundException("User doesn't exist!");
    }
    const isMatch = Utils.comparePassword(
      loginDto.password,
      userSql[0].password,
    );
    if (!isMatch) {
      throw new BadRequestException('Wrong credentials !');
    }

    const payload = { user_id: userSql[0].id, username: userSql[0].name };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      message: 'user created',
      access_token: access_token,
    };
  }
  async register(createUserDto: CreateUserDto) {
    const isExistUser = await this.sqlDb.query(
      `SELECT * FROM users WHERE email = '${createUserDto.email}'`,
    );
    if (isExistUser.length > 0) {
      throw new BadRequestException('User alredy exist !');
    }
    const hashedPassword = Utils.hashPassword(createUserDto.password);

    const image = createUserDto.image || '';
    await this.sqlDb.query(
      `INSERT INTO users (email,name,password,image,role) VALUES ('${createUserDto.email}','${createUserDto.name}','${hashedPassword}',${image}, 'user')`,
    );

    const user = await this.sqlDb
      .query(
        `SELECT * FROM users WHERE email = '${createUserDto.email}' LIMIT 1 `,
      )
      .then((res) => res[0]);

    const payload = { user_id: user.id, username: user.name };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      message: 'user created',
      access_token: access_token,
    };
  }

  async registerAdmin(createUserDto: CreateUserDto) {
    const isExistUser = await this.sqlDb.query(
      `SELECT * FROM users WHERE email = '${createUserDto.email}' LIMIT 1`,
    );
    if (isExistUser.length > 0) {
      throw new BadRequestException('User alredy exist !');
    }
    const hashedPassword = Utils.hashPassword(createUserDto.password);

    await this.sqlDb.query(
      `INSERT INTO users (email,name,password,image,role) VALUES ('${createUserDto.email}','${createUserDto.name}','${hashedPassword}','', 'admin')`,
    );

    const user = await this.sqlDb
      .query(
        `SELECT * FROM users WHERE email = '${createUserDto.email}' LIMIT 1 `,
      )
      .then((res) => res[0]);

    const payload = { user_id: user.id, username: user.name };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      message: 'user created',
      access_token: access_token,
    };
  }
}
