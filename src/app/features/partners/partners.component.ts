import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PartnerService } from '../../core/services/partner.service';
import { AuthService } from '../../core/services/auth.service';
import { Partner } from '../../core/models';
import { LucideAngularModule, Plus, Search, Filter, X, Mail, Calendar, User, ExternalLink, Trash2, Clipboard, Check } from 'lucide-angular';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DataTableComponent, LucideAngularModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slidePanel', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.2, 0.8, 0.4, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.2, 0.8, 0.4, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('pageEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div @pageEntrance class="space-y-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">Partners</h1>
          <p class="text-secondary-600 mt-1">Manage your partner relationships</p>
        </div>
        <button *ngIf="authService.currentUserProfile$ | async as profile" 
                [hidden]="profile.role !== 'Admin'"
                (click)="showAddModal = true" 
                class="btn btn-primary flex items-center gap-2 px-6">
          <lucide-icon [img]="icons.Plus" class="w-5 h-5"></lucide-icon>
          <span>Add Partner</span>
        </button>
      </div>
      

      
      <!-- Partners Table -->
      <app-data-table
        title="All Partners"
        [columns]="columns"
        [data]="filteredPartners"
        [loading]="loading"
        [showActions]="true"
        [showFilters]="true"
        [showExport]="true"
        [searchQuery]="searchQuery"
        searchPlaceholder="Search partners by name or email..."
        [statusFilter]="statusFilter"
        [statusOptions]="['Active', 'Paused', 'Inactive']"
        (searchQueryChange)="searchQuery = $event; filterPartners()"
        (statusFilterChange)="statusFilter = $event; filterPartners()"
        (actionTriggered)="handleAction($event)"
      ></app-data-table>

      <!-- Quick View Sidebar -->
      <div *ngIf="showQuickView" 
           class="fixed inset-0 z-[60] overflow-hidden" 
           aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div @fadeIn class="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm transition-opacity" (click)="showQuickView = false"></div>
        
        <div class="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div @slidePanel class="w-screen max-w-md transform transition-all">
            <div class="flex h-full flex-col bg-white shadow-2xl">
              <!-- Header -->
              <div class="p-6 bg-primary-600">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-bold text-white">Partner Quick View</h2>
                  <button (click)="showQuickView = false" class="text-white/80 hover:text-white transition-colors">
                    <lucide-icon [img]="icons.X" class="w-6 h-6"></lucide-icon>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 overflow-y-auto p-6 space-y-8">
                <div class="flex flex-col items-center text-center space-y-4">
                  <div class="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold border-4 border-primary-50">
                    {{ (selectedPartner?.name || '')[0].toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-secondary-900">{{ selectedPartner?.name }}</h3>
                    <p class="text-secondary-500 uppercase text-xs font-bold tracking-widest mt-1">{{ selectedPartner?.status }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="p-4 bg-secondary-50 rounded-xl flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm">
                      <lucide-icon [img]="icons.Mail" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-xs text-secondary-500 font-medium">Email Address</p>
                      <p class="text-secondary-900 font-semibold">{{ selectedPartner?.email }}</p>
                    </div>
                  </div>

                  <div class="p-4 bg-secondary-50 rounded-xl flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm">
                      <lucide-icon [img]="icons.Calendar" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-xs text-secondary-500 font-medium">Joined Date</p>
                      <p class="text-secondary-900 font-semibold">{{ selectedPartner?.createdAt | date:'mediumDate' }}</p>
                    </div>
                  </div>
                </div>

                <div class="border-t border-secondary-100 pt-6">
                  <h4 class="text-sm font-bold text-secondary-900 mb-4 px-1">Quick Actions</h4>
                  <div class="space-y-2 px-1">
                    <button (click)="openEditModal(selectedPartner)" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 text-secondary-700 transition-all font-medium">
                      <lucide-icon [img]="icons.Plus" class="w-4 h-4"></lucide-icon>
                      <span>Edit Details</span>
                    </button>
                    <a [routerLink]="['/partners', selectedPartner?.id]" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 text-secondary-700 transition-all font-medium">
                      <lucide-icon [img]="icons.ExternalLink" class="w-4 h-4"></lucide-icon>
                      <span>View Full Analytics</span>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-6 border-t border-secondary-100 bg-secondary-50/50">
                <button (click)="showQuickView = false" class="w-full btn btn-secondary py-3">Close Panel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Add Partner Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-md w-full overflow-hidden">
          <div *ngIf="!showInviteSuccess">
            <h2 class="text-2xl font-bold text-secondary-900 mb-6">Add New Partner</h2>
            
            <form (ngSubmit)="addPartner()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Name</label>
                <input type="text" [(ngModel)]="newPartner.name" name="name" required class="input" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Email</label>
                <input type="email" [(ngModel)]="newPartner.email" name="email" required class="input" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                <select [(ngModel)]="newPartner.status" name="status" class="input">
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div *ngIf="authService.isDemo()" class="p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4">
                <p class="text-xs text-warning-700 font-medium">
                  ⚠️ You are in <strong>Demo Mode</strong>. Changes may not be saved to the real database.
                </p>
              </div>

              <div *ngIf="errorMessage" class="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <p class="text-sm text-danger">{{ errorMessage }}</p>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button type="submit" [disabled]="submitting" class="btn btn-primary flex-1">
                  {{ submitting ? 'Adding...' : 'Add Partner' }}
                </button>
                <button type="button" (click)="closeAddModal()" class="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>

          <!-- Invite Success State -->
          <div *ngIf="showInviteSuccess" class="py-4">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
              <lucide-icon [img]="icons.Check" class="w-8 h-8"></lucide-icon>
            </div>
            <h2 class="text-2xl font-bold text-center text-secondary-900 mb-2">Partner Created!</h2>
            <p class="text-secondary-500 text-center mb-8 px-4">Account created for <strong>{{ lastAddedPartner?.name }}</strong>. Send them the invitation below.</p>

            <div class="bg-secondary-50 p-4 rounded-xl border border-secondary-200 mb-8 relative">
              <pre class="text-xs text-secondary-700 font-sans whitespace-pre-wrap leading-relaxed">
Hi {{ lastAddedPartner?.name }}!

Your Partnerly account is ready. 
Login at: {{ windowLocationOrigin }}/login
Email: {{ lastAddedPartner?.email }}
Temp Password: Partner123!</pre>
            </div>

            <div class="flex flex-col gap-3">
              <button (click)="copyInviteToClipboard()" 
                      class="btn btn-primary flex items-center justify-center gap-2 py-3 shadow-lg shadow-primary-200">
                <lucide-icon [img]="copied ? icons.Check : icons.Clipboard" class="w-5 h-5"></lucide-icon>
                <span>{{ copied ? 'Invitation Copied!' : 'Copy Invitation Details' }}</span>
              </button>
              <button (click)="closeAddModal()" class="btn btn-secondary py-3">Done</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Edit Partner Modal -->
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
        <div class="card max-w-md w-full overflow-hidden">
          <div *ngIf="!showInviteSuccess">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-secondary-900">Edit Partner</h2>
              <button (click)="closeEditModal()" class="text-secondary-400 hover:text-secondary-600">
                <lucide-icon [img]="icons.X" class="w-5 h-5"></lucide-icon>
              </button>
            </div>
            
            <form (ngSubmit)="updatePartner()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Name</label>
                <input type="text" [(ngModel)]="newPartner.name" name="name" required class="input" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Email Address</label>
                <input type="email" [(ngModel)]="newPartner.email" name="email" required class="input" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Account Status</label>
                <select [(ngModel)]="newPartner.status" name="status" class="input">
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div *ngIf="authService.isDemo()" class="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p class="text-xs text-warning-700 font-medium">
                  ⚠️ Demo Mode: Changes might not persist.
                </p>
              </div>

              <div *ngIf="errorMessage" class="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <p class="text-sm text-danger">{{ errorMessage }}</p>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button type="submit" [disabled]="submitting" class="btn btn-primary flex-1">
                  {{ submitting ? 'Saving...' : 'Save Changes' }}
                </button>
                <button type="button" (click)="closeEditModal()" class="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>

          <!-- Invite Success State (Reusable for Edit) -->
          <div *ngIf="showInviteSuccess" class="py-4">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
              <lucide-icon [img]="icons.Check" class="w-8 h-8"></lucide-icon>
            </div>
            <h2 class="text-2xl font-bold text-center text-secondary-900 mb-2">Partner Updated!</h2>
            <p class="text-secondary-500 text-center mb-8 px-4">Profile updated for <strong>{{ lastAddedPartner?.name }}</strong>. Send them the invitation below.</p>

            <div class="bg-secondary-50 p-4 rounded-xl border border-secondary-200 mb-8 relative">
              <pre class="text-xs text-secondary-700 font-sans whitespace-pre-wrap leading-relaxed">
Hi {{ lastAddedPartner?.name }}!

Your Partnerly account is ready. 
Login at: {{ windowLocationOrigin }}/login
Email: {{ lastAddedPartner?.email }}
Temp Password: Partner123!</pre>
            </div>

            <div class="flex flex-col gap-3">
              <button (click)="copyInviteToClipboard()" 
                      class="btn btn-primary flex items-center justify-center gap-2 py-3 shadow-lg shadow-primary-200">
                <lucide-icon [img]="copied ? icons.Check : icons.Clipboard" class="w-5 h-5"></lucide-icon>
                <span>{{ copied ? 'Invitation Copied!' : 'Copy Invitation Details' }}</span>
              </button>
              <button (click)="closeEditModal()" class="btn btn-secondary py-3">Done</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PartnersComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private partnerService = inject(PartnerService);
  public authService = inject(AuthService);

  partners: Partner[] = [];
  filteredPartners: Partner[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  errorMessage: string = '';
  submitting: boolean = false;
  loading: boolean = true;
  showAddModal: boolean = false;
  showQuickView: boolean = false;
  showEditModal: boolean = false;

  selectedPartner?: Partner;

  newPartner: Omit<Partner, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    status: 'Active'
  };

  showInviteSuccess: boolean = false;
  lastAddedPartner: any = null;
  copied: boolean = false;
  windowLocationOrigin = window.location.origin;

  readonly icons = {
    Plus,
    Search,
    Filter,
    X,
    Mail,
    Calendar,
    User,
    ExternalLink,
    Trash2,
    Clipboard,
    Check
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'Partner Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'createdAt', label: 'Created Date', type: 'date' }
  ];

  ngOnInit() {
    this.loadPartners();
  }

  private loadPartners() {
    this.loading = true;
    this.partnerService.getPartners().subscribe({
      next: (partners) => {
        this.partners = partners;
        this.filterPartners();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading partners:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterPartners() {
    this.filteredPartners = this.partners.filter(partner => {
      const matchesSearch = !this.searchQuery ||
        partner.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        partner.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || partner.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }


  async addPartner() {
    if (!this.newPartner.name || !this.newPartner.email) {
      this.errorMessage = 'Name and email are required';
      return;
    }

    this.errorMessage = '';
    this.submitting = true;
    try {
      await this.partnerService.addPartner(this.newPartner as Omit<Partner, 'id'>);
      this.lastAddedPartner = { ...this.newPartner };
      this.showInviteSuccess = true;
      this.cdr.detectChanges();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error adding partner';
    } finally {
      this.submitting = false;
    }
  }

  handleAction(event: { type: string, row: any }) {
    this.selectedPartner = event.row;
    if (event.type === 'view') {
      this.showQuickView = true;
    } else if (event.type === 'edit') {
      this.openEditModal(event.row);
    }
  }

  openEditModal(partner: any) {
    this.selectedPartner = partner;
    this.newPartner = {
      name: partner.name,
      email: partner.email,
      status: partner.status
    };
    this.showEditModal = true;
    this.showQuickView = false;
  }

  async updatePartner() {
    if (!this.selectedPartner?.id) return;

    this.errorMessage = '';
    this.submitting = true;
    try {
      // Remove undefined fields to prevent Firestore update errors
      const cleanedPartner = Object.fromEntries(
        Object.entries(this.newPartner).filter(([_, v]) => v !== undefined)
      );

      await this.partnerService.updatePartner(this.selectedPartner.id, cleanedPartner);
      this.lastAddedPartner = { ...this.newPartner };
      this.showInviteSuccess = true;
      this.loadPartners(); // Refresh data
      this.cdr.detectChanges();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error updating partner';
    } finally {
      this.submitting = false;
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.showInviteSuccess = false;
    this.lastAddedPartner = null;
    this.copied = false;
    this.resetForm();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.showInviteSuccess = false;
    this.lastAddedPartner = null;
    this.copied = false;
    this.resetForm();
  }

  resetForm() {
    this.errorMessage = '';
    this.selectedPartner = undefined;
    this.newPartner = {
      name: '',
      email: '',
      status: 'Active'
    };
    this.cdr.detectChanges();
  }

  copyInviteToClipboard() {
    const text = `Hi ${this.lastAddedPartner?.name}!

Your Partnerly account is ready. 
Login at: ${this.windowLocationOrigin}/login
Email: ${this.lastAddedPartner?.email}
Temp Password: Partner123!`;

    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copied = false;
        this.cdr.detectChanges();
      }, 3000);
    });
  }
}
