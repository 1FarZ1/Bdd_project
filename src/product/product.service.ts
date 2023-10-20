/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Product } from './product';

function generateNumberList(length: number): number[] {
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(i);
    }
    return result;
  }
  
  const productsList = generateNumberList(10).map((i) => {
    return new Product(i, `Product ${i}`, `This is product #${i}`, i * 100);
  });

@Injectable()
export class ProductService {
  products: Product[] = productsList;
  getAllProducts(): Product[] {
    return this.products;
  }

  getProductDetaills(productId: string): Product {
    return this.products[Number.parseInt(productId)];
  }

  addProduct(product: Product): Product {
    this.products.push(product);
    return product;
  }
  updateProductDetaills(productId: string): Product {
    this.products = this.products.map((p) => {
      console.log(productId);

      if (p.id == Number.parseInt(productId)) {
        p.name = 'updated';
      }

      return p;
    });
    return this.products[Number.parseInt(productId)];
  }

  deleteProduct(productId: string): Product {
    this.products = this.products.filter(
      (p) => p.id != Number.parseInt(productId),
    );
    return this.products[Number.parseInt(productId)];
  }
}