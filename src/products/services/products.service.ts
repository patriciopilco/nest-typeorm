import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from './../entities/product.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product) private productRepo:Repository<Product>,
    ){}

    findAll(){
        return this.productRepo.find();
    }

    findOne(id:number){
        const product = this.productRepo.findOneBy({id: id })
        if(!product){
            throw new NotFoundException(`Producto #${id} not found`);
        }
        return product;
    }
}
