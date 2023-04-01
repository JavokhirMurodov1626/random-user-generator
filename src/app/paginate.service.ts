import { RandomUser } from './random-user.service';
import { Injectable } from '@angular/core';

import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PaginateService {

  constructor() { }

paginate(items:RandomUser[],currentPage:number,dataCount:number){
    const startIndex=(currentPage-1)*dataCount;
    return _(items).slice(startIndex).take(dataCount).value();
}

}
