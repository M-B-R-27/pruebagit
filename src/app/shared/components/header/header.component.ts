import { Component, OnInit, Input, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UtilsService } from 'src/app/services/utils';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule]
})
export class HeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() backButton!: string;
  @Input() isModal!: boolean;
  @Input() color: string = 'primary';
  @Input() showMenu!: boolean;


  utilsSvc = inject(UtilsService);

  ngOnInit() { }

  dismissModal(){
    this.utilsSvc.dismissModal();
  }

}