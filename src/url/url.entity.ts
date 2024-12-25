import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Url {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({ unique: true})
    @Index()
    url: string;

    @Column({ default: true})
    isActive: boolean;

    @Column({type: 'timestamp' , default: () => "CIRRENT_TIMESTAMP"})
    createdAt: Date;
}