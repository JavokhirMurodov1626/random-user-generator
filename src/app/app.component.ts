import { PaginateService } from './paginate.service';
import { RandomUserService } from './random-user.service';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RandomUser } from './random-user.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private randomUserService: RandomUserService,
    private router: Router,
    private paginate: PaginateService
  ) {}

  @ViewChild('selection', { static: true })
  selectRef!: ElementRef<HTMLSelectElement>;

  totalUsers: number = 90;

  //we assign fetched data to this variable
  randomUsers: RandomUser[] = [];

  // we reassign every time page changes with a chunk of users
  paginatedUsers: RandomUser[] = [];

  // assigning error message
  error = '';

  errorsPerRecord: number = 0;

  selectedCountry: string = 'us';

  randomSeed: string = 'hello';

  countries = [
    { value: 'us', name: 'USA' },
    { value: 'au', name: 'Australia' },
    { value: 'br', name: 'Brasil' },
  ];
  //working with pages
  usersPerPage = 20;

  currentPage = 1;
  // scroll page begins from 3 because on table there are 20 users, if every time we push 10 users it means 2 pages 
  // has been uploaded already and next 3 page is going to be displyed
  scrollPage=3;

  isLoadingMore=false;

  pageCount = Math.ceil(this.totalUsers / this.usersPerPage);

  pages = _.range(1, this.pageCount + 1);

  ngOnInit(): void {
    this.getRandomUsers();
  }

  onSelect(event: Event) {
    this.selectedCountry = (event.target as HTMLSelectElement).value;
  }

  onGenerateUsers() {
    this.getRandomUsers();
  }

  onGenerateRandomSeed() {
    this.randomSeed = Math.floor(Math.random() * 1000000).toString();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.scrollPage=page+(page-1)+2;
    const paginatedUsers = this.paginate.paginate(
      this.randomUsers,
      this.currentPage,
      this.usersPerPage
    );
    this.paginatedUsers = paginatedUsers;
  }

  getRandomUsers() {
    
    return this.randomUserService
      .generateUsers(
        this.selectedCountry,
        this.randomSeed,
        this.currentPage,
        this.totalUsers
      )
      .subscribe({
        next: (res) => {
          ///adding query params to route
          this.router.navigate(['/'], {
            queryParams: {
              page: `${this.currentPage}`,
              results: `${this.totalUsers}`,
              seed: `${this.randomSeed}`,
              nat: `${this.selectedCountry}`,
            },
          });

          //retrieving needed properties and create new list of users
          const generatedUsers = res.results.map(
            (user: any, userIndex: number) => {
              const generatedUser = {
                index: userIndex + 1,
                identifier: user.login.uuid.slice(0, 7),
                fullName: `${user.name.title} ${user.name.first} ${user.name.last}`,
                fullAddress: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state} ${user.location.postcode}`,
                phone: user.phone,
              };

              //if number of errors is more than zore apply addErros method
              if (this.errorsPerRecord > 0) {
                return this.addErrors(generatedUser, this.errorsPerRecord);
              } else {
                return generatedUser;
              }
            }
          );
          this.scrollPage=3;
          this.currentPage=1;
          this.randomUsers = [...generatedUsers];

          //when component is initiated, first chunk of info is displayed
          const paginatedUsers = this.paginate.paginate(
            this.randomUsers,
            this.currentPage,
            this.usersPerPage
          );

          this.paginatedUsers = paginatedUsers;
          console.log(this.randomUsers);
        },

        error: (errorMessage: string) => {
          return this.error;
        },
      });
  }

  addErrors(user: any, errorRate: number): any {
    // error types
    const errorTypes = ['add', 'delete', 'swap'];
    // english alphabet
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    //cloning passed users array
    let userData = { ...user };
    //fields to change
    const fields = ['fullName', 'fullAddress', 'phone'];

    //adding random field of user data using random errors
    for (let i = 0; i < errorRate; i++) {
      const type = errorTypes[Math.floor(Math.random() * 3)];
      const field = fields[Math.floor(Math.random() * 3)]; // 0: name, 1: address, 2: phone
      console.log(field, type);
      switch (type) {
        case 'delete': // delete character
          const index = Math.floor(Math.random() * userData[field].length);
          console.log('before', userData[field]);

          userData[field] =
            userData[field].slice(0, index) + userData[field].slice(index + 1);
          console.log('after', userData[field]);
          break;
        case 'add': // add character
          const char = alphabet.charAt(
            Math.floor(Math.random() * alphabet.length)
          );
          const position = Math.floor(Math.random() * userData[field].length);
          userData[field] =
            userData[field].slice(0, position) +
            char +
            userData[field].slice(position);
          break;
        case 'swap': // swap characters
          const index1 = Math.floor(
            Math.random() * (userData[field].length - 1)
          );
          const index2 = index1 + 1;
          userData[field] =
            userData[field].slice(0, index1) +
            userData[field].charAt(index2) +
            userData[field].charAt(index1) +
            userData[field].slice(index2 + 1);
          break;
      }

      return userData;
    }
  }

  // infinite scrolling
  onScroll() {
    this.isLoadingMore=true;
    setTimeout(()=>{
      if (
        this.paginatedUsers.length % this.usersPerPage === 0 &&
        this.currentPage < this.pages.length
      ) {
        this.currentPage++;
      }

      
      let startIndex = (this.scrollPage-1)*10;
  
      const endIndex = startIndex + 10;
  
      if (this.paginatedUsers.length <= this.randomUsers.length) {
        this.paginatedUsers = [
          ...this.paginatedUsers,
          ...this.randomUsers.slice(startIndex, endIndex),
        ];
      }
  
      this.scrollPage++;
      console.log(this.scrollPage)
    },1000)

    this.isLoadingMore=false
  }
}
