import {Component, inject} from '@angular/core';
import {LayoutService} from '../../core/services/layout.service';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {AutoFocusModule} from 'primeng/autofocus';

@Component({
    selector: '[app-search]',
    standalone: true,
    imports: [DialogModule, InputTextModule, AutoFocusModule],
    template: ` <p-dialog [(visible)]="searchBarActive" [breakpoints]="{ '992px': '75vw', '576px': '90vw' }" modal dismissableMask styleClass="w-1/2">
        <ng-template #headless>
            <div class="search-container">
                <i class="pi pi-search"></i>
                <input pInputText type="text" [pAutoFocus]="true" class="p-inputtext search-input" placeholder="Search" (keydown.enter)="toggleSearchBar()" />
            </div>
        </ng-template>
    </p-dialog>`
})
export class AppSearch {
    layoutService = inject(LayoutService);

    get searchBarActive(): boolean {
        return this.layoutService.layoutState().searchBarActive;
    }

    set searchBarActive(_val: boolean) {
        this.layoutService.layoutState.update((prev) => ({...prev, searchBarActive: _val}));
    }

    toggleSearchBar() {
        this.layoutService.layoutState.update((value) => ({...value, searchBarActive: !value.searchBarActive}));
    }
}
