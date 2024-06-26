import { Quero } from '@core/decorators/quero.decorator';
import { Rest } from '@core/decorators/restaurant.decorator';
import { OwnerAuthGuard } from '@core/guards/auth.guard';
import { OwnerGuard } from '@core/guards/owner.guard';
import { AwsService } from '@core/services/aws.service';
import { PermAct, PermOwner } from '@core/services/role.service';
import { Media } from '@db/entities/core/media.entity';
import { Category } from '@db/entities/owner/category.entity';
import { ProductCategory } from '@db/entities/owner/product-category.entity';
import { ProductStock } from '@db/entities/owner/product-stock.entity';
import { Product } from '@db/entities/owner/product.entity';
import { ProductTransformer } from '@db/transformers/product.transformer';
import { StockTransformer } from '@db/transformers/stock.transformer';
import { ValidationException } from '@lib/exceptions/validation.exception';
import { Validator } from '@lib/helpers/validator.helper';
import { Permissions } from '@lib/rbac';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { In, Not } from 'typeorm';

@Controller(':product_id')
@UseGuards(OwnerAuthGuard())
export class DetailController {
  constructor(private aws: AwsService) {}

  @Get()
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.R}`)
  async show(@Rest() rest, @Res() response, @Param() param) {
    const product = await Product.findOneByOrFail({ restaurant_id: rest.id, id: param.product_id });
    await response.item(product, ProductTransformer);
  }

  @Put()
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.C}`)
  async update(@Rest() rest, @Body() body, @Res() response, @Param() param) {
    const rules = {
      sku: 'required|sku',
      name: 'required|string',
      description: 'string',
      price: 'required|numeric|min:0',
    };
    const validation = Validator.init(body, rules);
    if (validation.fails()) {
      throw new ValidationException(validation);
    }

    if (!param.product_id) {
      throw new BadRequestException();
    }

    const productExist = await Product.exists({
      where: { sku: body.sku, restaurant_id: rest.id, id: Not(param.product_id) },
    });
    if (productExist) {
      throw new BadRequestException('Product has already existed.');
    }

    const product = await Product.findOneByOrFail({ id: param.product_id });
    product.sku = body.sku;
    product.name = body.name;
    product.description = body.decription;
    product.price = body.price;
    await product.save();

    return response.item(product, ProductTransformer);
  }

  @Post('/images')
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.U}`)
  async uploadImage(@Param() param, @Req() request, @Res() response, @Rest() rest) {
    const product = await Product.findOrFail({ where: { id: param.product_id, restaurant_id: rest.id } });
    if ((await Media.total(product)) >= 5) {
      throw new BadRequestException('Maximum total image allowed is 5');
    }

    const file = await this.aws.uploadFile(request, response, 'image', {
      dynamicPath: `restaurants/${rest.id}/products`,
    });

    await Media.add<Product>(product, file);

    await response.item(product, ProductTransformer);
  }

  @Delete('/images/:image_id')
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.D}`)
  async deleteImage(@Param() param, @Res() response, @Rest() rest) {
    const product = await Product.findOrFail({ where: { id: param.product_id, restaurant_id: rest.id } });
    const media = await Media.findOrFail({ where: { id: param.image_id, product_id: product.id } });

    await this.aws.removeFile(media);

    return response.noContent();
  }

  @Post('/categories')
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.U}`)
  async addCategory(@Body() body, @Res() response, @Param() param, @Rest() rest) {
    const rules = {
      category_ids: 'required|array|uid',
    };
    const validation = Validator.init(body, rules);
    if (validation.fails()) {
      throw new ValidationException(validation);
    }

    const product = await Product.findOrFail({ where: { id: param.product_id, restaurant_id: rest.id } });
    const prodCategories: ProductCategory[] = [];

    const categories = await Category.findBy({ id: In(body.category_ids) });
    for (const category of categories) {
      const isExist = await ProductCategory.exists({ where: { product_id: product.id, category_id: category.id } });
      if (isExist) {
        continue;
      }

      const pcat = new ProductCategory();
      pcat.product_id = product.id;
      pcat.category_id = category.id;
      prodCategories.push(pcat);
    }

    if (prodCategories.length > 0) {
      await ProductCategory.save(prodCategories);
    }

    await response.item(product, ProductTransformer);
  }

  @Delete('/categories/:category_id')
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.D}`)
  async deleteCategory(@Param() param, @Res() response, @Rest() rest) {
    if (!param.category_id) {
      throw new BadRequestException();
    }

    const product = await Product.findOrFail({ where: { id: param.product_id, restaurant_id: rest.id } });
    const category = await ProductCategory.findOneByOrFail({ id: param.category_id, product_id: product.id });

    await category.remove();

    return response.noContent();
  }

  @Get('/stocks')
  @UseGuards(OwnerGuard)
  @Permissions(`${PermOwner.Product}@${PermAct.R}`)
  async getStocks(@Param() param, @Res() response, @Rest() rest, @Quero() quero) {
    if (!param.product_id) {
      throw new BadRequestException();
    }

    const product = await Product.findOrFail({ where: { id: param.product_id, restaurant_id: rest.id } });
    const where = { product_id: product.id };

    if (quero.location_id) {
      Object.assign(where, { ...where, location_id: quero.location_id });
    }

    const stocks = await ProductStock.findBy(where);

    return response.collection(stocks, StockTransformer);
  }
}
