import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-rating-bar',
  templateUrl: './rating-bar.component.html',
  styleUrls: ['./rating-bar.component.css']
})
export class RatingBarComponent implements OnInit {

  constructor() { }

  @Input() ratingPositive:number;
  @Input() ratingNegative:number;

  getPositivePercentage ():string {
    return (this.ratingPositive / (this.ratingPositive + this.ratingNegative))*100 + "%";
  }

  getNegativePercentage ():string {
    return (this.ratingNegative / (this.ratingPositive + this.ratingNegative))*100 + "%";
  }

  ngOnInit() {
  }

}
