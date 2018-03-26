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
    console.log((this.ratingNegative / (this.ratingPositive + this.ratingNegative))*100 + "%");
    console.log(this.ratingNegative,this.ratingPositive);
    return (this.ratingNegative / (this.ratingPositive + this.ratingNegative))*100 + "%";
  }

  ngOnInit() {
  }

}
