import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { PetService } from '../services/pet.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './pet-profile.page.html',
  styleUrls: ['./pet-profile.page.scss']
})
export class PetProfilePage implements OnInit {
    Pets: any[] = [];

  pet: any = {
    name: '',
    type: '',
    breed: '',
    gender: '',
    birth_date: '',
    weight: null,
    taille: '',
    is_vaccinated: null,
    has_contagious_diseases: null,
    has_medical_file: null,
    is_critical_condition: null,
    photo_profil: null,
  };
  photo_profil: File | null = null;
  albumPhotos: File[] = [];
  preview: string | null = null;

  isEditMode: boolean = false;
  petId!: number;

  animalBreeds: { [key: string]: string[] } = {
    'Chien': [ 'Labrador','Berger Allemand','Bulldog','Golden Retriever','Beagle','Caniche','Husky','Shih Tzu' ],
    'Chat': [ 'Siamois','Persan','Maine Coon','Bengal','Sphynx','Ragdoll' ],
    'Lapin': [ 'Holland Lop','Netherland Dwarf','Angora','Rex' ],
    'Oiseau': [ 'Perruche','Canari','Calopsitte','Perroquet' ],
    'Poisson': [ 'Poisson rouge','Combattant','Guppy','Scalaire' ],
    'Autre': [
      'Abyssin','Angora','Péruvien','Texel','Rex',
      'Albinos','Zibeline','Champagne','Angora',
      'Gris du Gabon','Ara bleu','Perruche ondulée',
      'Pionus','Caique','de Hermann','étoilée',
      'sulcata','boîte d’eau','Python royal',
      'Couleuvre cornue','Boa constrictor',
      'Couleuvre de Rat','Couleuvre royale',
      'Standard','White mosaic','Ebony','Sapphire',
      'Violet','Fancy mouse','Black mouse',
      'Golden mouse','Dalmatian mouse'
    ]
  };

  types = [
    { value: 'Chien', label: 'Chien' },
    { value: 'Chat', label: 'Chat' },
    { value: 'Lapin', label: 'Lapin' },
    { value: 'Oiseau', label: 'Oiseau' },
    { value: 'Poisson', label: 'Poisson' },
    { value: 'Autre', label: 'Autre' },
  ];
  otherTypes = [ 'Cobaye','Furet','Po rouet','Tortue','Serpent','Chinchilla','Souris' ];

  vaccOptions = [
    { value: 1, label: 'Vacciné', icon: 'vacciné.svg' },
    { value: 0, label: 'Non vacciné', icon: 'non_vacciné.svg' },
  ];

  diseaseOptions = [
    { value: 1, label: 'Oui', icon: 'contagious-yes.svg' },
    { value: 0, label: 'Non', icon: 'contagious-no.svg' },
  ];

  medicalFolder = [
    { value: 1, label: 'Oui', icon: 'medicalFolder.png' },
    { value: 0, label: 'Non', icon: 'medicalFolder-no.png' },
  ];

  criticalCondition = [
    { value: 1, label: 'Oui', icon: 'Critical-Yes.jpg' },
    { value: 0, label: 'Non', icon: 'Critical-no.jpg' },
  ];

  petTypeOther: string | null = null;
  showDatePicker: boolean = false;

  constructor(
    private storage: Storage,
    private toastCtrl: ToastController,
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
        private auth: AuthService,

  ) {}

  async ngOnInit() {
    await this.storage.create();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.petId = +id;
        this.loadPetForEdit(this.petId);
      }
    });
  }

  private loadPetForEdit(id: number) {
    this.petService.getPetById(id).subscribe({
      next: res => {
        const p = (res as any).pet ?? res;
        this.pet = {
          ...p,
          is_vaccinated: p.is_vaccinated,
          has_contagious_diseases: p.has_contagious_diseases,
          has_medical_file: p.has_medical_file,
          is_critical_condition: p.is_critical_condition
        };
        this.preview = p.photo_profil
          ? `http://localhost:8000/storage/${p.photo_profil}`
          : null;
      },
      error: err => console.error('Erreur chargement pet:', err)
    });
  }

  getBreeds() {
    return this.pet.type ? this.animalBreeds[this.pet.type] || [] : [];
  }

  onTypeChange(type: string) { this.pet.breed = ''; }
  onPhotoSelected(e: any) { if (e.target.files[0]) this.photo_profil = e.target.files[0]; }
  onFilesSelected(e: Event) {
    const input = (e.target as HTMLInputElement);
    if (input.files) this.albumPhotos = Array.from(input.files);
  }

  async savePet() {
    const currentUser = await this.storage.get('current_user');
    if (!currentUser?.roles?.includes('petowner')) {
      this.presentToast('Accès refusé : réservé aux petowners','danger');
      return;
    }

    const formData = new FormData();
    formData.append('pet_owner_id', currentUser.id.toString());
    formData.append('name', this.pet.name || '');
    formData.append('type', this.pet.type || '');
    if (this.pet.type === 'Autre') {
      formData.append('type_other', this.petTypeOther || '');
    }
    formData.append('breed', this.pet.breed || '');
    formData.append('taille', this.pet.taille || '');
    formData.append('gender', this.pet.gender || '');
    formData.append('birth_date', this.formatDateToYMD(this.pet.birth_date));
    formData.append('weight', this.pet.weight?.toString() || '');
    formData.append('training', this.pet.training?.toString() || '');

    // ← BOOLEANS now as "1"/"0"
    formData.append('is_vaccinated', this.pet.is_vaccinated ? '1' : '0');
    formData.append('has_contagious_diseases', this.pet.has_contagious_diseases ? '1' : '0');
    formData.append('has_medical_file', this.pet.has_medical_file ? '1' : '0');
    formData.append('is_critical_condition', this.pet.is_critical_condition ? '1' : '0');

    if (this.photo_profil) {
      formData.append('photo_profil', this.photo_profil);
    }
    this.albumPhotos.forEach(file => formData.append('media[]', file));

    if (this.isEditMode) {
      formData.append('_method','PUT');
    }

    const call$ = this.isEditMode
      ? this.petService.updatePet(this.petId, formData)
      : this.petService.addPet(formData);
          const user = await this.auth.getCurrentUser();

       if (user?.id) {
      this.petService.getPetsByOwner(user.id).subscribe({
        next: (pets) => (this.Pets = pets),
        error: (err) =>
          console.error('Erreur de chargement des animaux:', err),
      });}

    call$.subscribe({
      next: () => {
        const msg = this.isEditMode ? 'Animal mis à jour avec succès' : 'Animal ajouté avec succès';
        this.presentToast(msg, 'success');
        this.router.navigate(['/pets']);
      },
      error: err => {
        console.error('Erreur savePet():', err);
        this.presentToast("Erreur lors de l'enregistrement",'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'bottom' });
    await toast.present();
  }

  formatDateToYMD(date: Date | string): string {
    const d = new Date(date);
    return [d.getFullYear(), (d.getMonth()+1).toString().padStart(2,'0'), d.getDate().toString().padStart(2,'0')].join('-');
  }

  onDateSelected(event: any): void {
    this.pet.birth_date = event.detail.value;
    this.showDatePicker = false;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
}
``
