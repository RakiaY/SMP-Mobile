import { Component ,ViewChild} from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonDatetime } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';





@Component({
  selector: 'app-guardian-form',
  templateUrl: './guardian-form.component.html',
  styleUrls: ['./guardian-form.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,
     FormsModule, RouterModule,
    ]
})
export class GuardianFormComponent {
  genderOptions = [
    { value: 'Male', label: 'Homme' },
    { value: 'Female', label: 'Femme' },
    { value: 'Other', label: 'Autre' }
  ];
  newPetSitter = {
    id: null,
    first_name: '',
    last_name: '',
    gender:'',
    phone: '',
    birth_date: '',

    email: '',
    password: '',
    password_confirmation: '',
    status: 'Pending',
     experience: '',
    personalQualities: '',
    skills: '',
  
    personal_address: {
      city: '',
      street: '',
      zipcode: ''
    },
    kennel_address: {
      city: '',
      street: '',
      zipcode: ''
    }
  };
    ACACED: File | null = null;
        profilePictureURL: File | null = null;


  
  birthDate: string = '';           
  birthDateValue: string = '';      
  showDatePicker: boolean = false;  
  selectedAddressType: string = 'personnelle'; 

  
  onDateSelected(event: any) {
  this.newPetSitter.birth_date = event.detail.value;
  this.showDatePicker = false;
}

// Pour afficher une date formatée dans le champ
formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(); // ou d.toISOString().slice(0, 10)
}
  selectedSegment: string = 'personnel';
  constructor(private router: Router , 
    private auth: AuthService,
        private fb: FormBuilder,
        private tost: ToastController

  ) {}
  

  onFileChange(event: Event, field: string): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      console.log(`Fichier(s) sélectionné(s) pour ${field}`, target.files);
    }
  }
  SubmitForm(form: NgForm):void{
      console.log("Tentative d'envoi...");

      if (form.invalid) return;


        const formData = new FormData();
        formData.append('first_name', this.newPetSitter.first_name);
      formData.append('last_name', this.newPetSitter.last_name);
      formData.append('gender', this.newPetSitter.gender);
      formData.append('phone', this.newPetSitter.phone);
formData.append('birth_date', this.formatDateToYMD(this.newPetSitter.birth_date));
      formData.append('email', this.newPetSitter.email);
      formData.append('password', this.newPetSitter.password);
      formData.append('password_confirmation', this.newPetSitter.password_confirmation);
      formData.append('status', this.newPetSitter.status);
      formData.append('experience', this.newPetSitter.experience);
      formData.append('personalQualities', this.newPetSitter.personalQualities);
      formData.append('skills', this.newPetSitter.skills);




      // Adresses : aplatir les objets
      formData.append('personal_address[city]', this.newPetSitter.personal_address.city);
      formData.append('personal_address[street]', this.newPetSitter.personal_address.street);
      formData.append('personal_address[zipcode]', this.newPetSitter.personal_address.zipcode);

      formData.append('kennel_address[city]', this.newPetSitter.kennel_address.city);
      formData.append('kennel_address[street]', this.newPetSitter.kennel_address.street);
      formData.append('kennel_address[zipcode]', this.newPetSitter.kennel_address.zipcode);

      // Fichier ACACED
      if (this.ACACED) {
        formData.append('ACACED', this.ACACED);
      }
       if (this.profilePictureURL) {
        formData.append('profile_picture', this.profilePictureURL);
      }
       this.auth.sitterRegister(formData).subscribe({
    next: async (value) => {
    this.router.navigate(['/confirmation-guardian']);

      const toast = await this.tost.create({
        message: 'Inscription succès, veuillez attendre notre acceptation bientôt.',
        duration: 3000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    },
     error: (err) => {
      console.error('Erreur', err);
      if (err.status === 422) {
        console.log('Erreurs de validation:', err.error.errors);
      }
    }
  });

  }
  onAcacedFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.ACACED = file;
  }
}
onPhotoFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.profilePictureURL = file;
  }
}
getGenderLabel(value: string): string {
  switch(value) {
    case 'Male': return 'Homme';
    case 'Female': return 'Femme';
    case 'Other': return 'Autre';
    default: return 'Sexe';
  }
}
 formatDateToYMD(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


}
