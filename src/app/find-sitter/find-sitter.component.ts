import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-find-sitter",
  templateUrl: "./find-sitter.component.html",
  styleUrls: ["./find-sitter.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class FindSitterComponent implements OnInit {
  sitters: any[] = []
  filteredSitters: any[] = []
  loading = false
  searchTerm = ""
  selectedFilters: any = {
    services: [],
    availability: [],
    rating: null,
  }

  constructor() {}

  ngOnInit() {
    this.loadSitters()
  }

  loadSitters() {
    this.loading = true
    // Simulate API call
    setTimeout(() => {
      this.sitters = [
        {
          id: 1,
          name: "Marie Dupont",
          photo: "assets/sitter1.jpg",
          rating: 4.8,
          reviews: 24,
          services: ["Promenade", "Garde à domicile"],
          availability: ["Matin", "Soir", "Week-end"],
          distance: 2.3,
          price: 15,
        },
        {
          id: 2,
          name: "Thomas Martin",
          photo: "assets/sitter2.jpg",
          rating: 4.5,
          reviews: 18,
          services: ["Garde à domicile", "Visite à domicile"],
          availability: ["Après-midi", "Soir"],
          distance: 3.7,
          price: 12,
        },
        {
          id: 3,
          name: "Sophie Bernard",
          photo: "assets/sitter3.jpg",
          rating: 4.9,
          reviews: 32,
          services: ["Promenade", "Garde à domicile", "Visite à domicile"],
          availability: ["Matin", "Après-midi", "Soir", "Week-end"],
          distance: 1.5,
          price: 18,
        },
      ]
      this.filteredSitters = [...this.sitters]
      this.loading = false
    }, 1000)
  }

  filterSitters() {
    this.filteredSitters = this.sitters.filter((sitter) => {
      // Filter by search term
      if (this.searchTerm && !sitter.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false
      }

      // Filter by services
      if (this.selectedFilters.services.length > 0) {
        const hasService = this.selectedFilters.services.some((service: string) => sitter.services.includes(service))
        if (!hasService) return false
      }

      // Filter by availability
      if (this.selectedFilters.availability.length > 0) {
        const hasAvailability = this.selectedFilters.availability.some((time: string) =>
          sitter.availability.includes(time),
        )
        if (!hasAvailability) return false
      }

      // Filter by rating
      if (this.selectedFilters.rating && sitter.rating < this.selectedFilters.rating) {
        return false
      }

      return true
    })
  }

  resetFilters() {
    this.searchTerm = ""
    this.selectedFilters = {
      services: [],
      availability: [],
      rating: null,
    }
    this.filteredSitters = [...this.sitters]
  }
}
