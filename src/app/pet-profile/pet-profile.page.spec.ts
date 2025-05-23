import { Component } from '@angular/core';
import { DatetimeChangeEventDetail, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonDatetimeCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './pet-profile.page.html',
  styleUrls: ['./pet-profile.page.scss'],
})
export class PetProfilePage {
albumPhotos: any;
onFilesSelected($event: Event) {
throw new Error('Method not implemented.');
}
medicalFolder: any;
criticalCondition: any;
formatDate(arg0: string) {
throw new Error('Method not implemented.');
}
diseaseOptions: any;
vaccOptions: any;
onDateSelected($event: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) {
throw new Error('Method not implemented.');
}
showDatePicker: any;
getBreeds(): any {
throw new Error('Method not implemented.');
}
types: any;
otherTypes: any;
petTypeOther: any;
onPhotoSelected($event: Event) {
throw new Error('Method not implemented.');
}
  pet = { name: '', description: '', breed: '', type: '',gender: '', birth_date: '', weight: null, is_vaccinated: null, has_contagious_disease: null,
    has_medical_file:null,is_critical_condition:null,  photo_profil: null , taille:''};
  preview: string | null = null ;
  


  savePet() {
    console.log('Animal enregistré', this.pet);
  }
}
