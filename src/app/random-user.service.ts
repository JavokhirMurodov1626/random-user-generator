import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface RandomUser{
  index:number,
  identifier:string,
  fullName:string,
  fullAddress:string,
  phone:number
}

@Injectable({
  providedIn: 'root'
})

export class RandomUserService {

  constructor(private http:HttpClient) {}

  generateUsers(nation:string,seed:string,pageNum:number,totalUsers:number){
    return this.http.get(`https://randomuser.me/api?page=${pageNum}&results=${totalUsers}&seed=${seed}&nat=${nation}`).
    pipe(catchError((error: any, caught: Observable<any>): Observable<any>=>{

      let errorMessage='unknown error occured!'

      if(!error) return throwError(errorMessage);

      errorMessage=error.error

      return throwError(errorMessage);
    }))
  }

}
