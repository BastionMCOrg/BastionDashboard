import {Component, computed, inject} from '@angular/core';
import {LayoutService} from '../../core/services/layout.service';

@Component({
    selector: '[app-footer]',
    standalone: true,
    template: `
        <div class="layout-footer">
            <div class="footer-logo-container">
                <img src="icon.png"/>
                <span class="footer-app-name">BastionMC</span>
            </div>
            <span class="footer-copyright">&#169; BastionMC - 2025</span>
        </div>
    `
})
export class AppFooter {
    layoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.layoutService.isDarkTheme());
}
