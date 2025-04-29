import {Component, computed, ElementRef, inject, model, OnInit, signal, ViewChild} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {StyleClassModule} from 'primeng/styleclass';
import {LayoutService} from '../../core/services/layout.service';
import {AppBreadcrumb} from './app.breadcrumb';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {RippleModule} from 'primeng/ripple';
import {BadgeModule} from 'primeng/badge';
import {OverlayBadgeModule} from 'primeng/overlaybadge';
import {AvatarModule} from 'primeng/avatar';
import {AuthService} from '../../core/services/auth.service';

interface NotificationsBars {
    id: string;
    label: string;
    badge?: string | any;
}

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppBreadcrumb, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, RippleModule, BadgeModule, OverlayBadgeModule, AvatarModule],
    template: `<div class="layout-topbar">
        <div class="topbar-left">
            <a tabindex="0" #menubutton type="button" class="menu-button" (click)="onMenuButtonClick()">
                <i class="pi pi-chevron-left"></i>
            </a>
            <img class="horizontal-logo" src="assets/images/crafting-table.png" alt="bastionmc-icon" />
            <span class="topbar-separator"></span>
            <div app-breadcrumb></div>
            <img class="mobile-logo" src="/assets/images/crafting-table.png" alt="bastionmc-icon" />
        </div>

        <div class="topbar-right">
            <ul class="topbar-menu">
                <li class="right-sidebar-item">
                    <button class="app-config-button" (click)="onConfigButtonClick()"><i class="pi pi-cog"></i></button>
                </li>

                <li class="profile-item static sm:relative">
                    <a class="right-sidebar-button relative z-50" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveActiveClass="animate-fadeout" leaveToClass="hidden" [hideOnOutsideClick]="true">
                        <p-avatar styleClass="!w-10 !h-10">
                            <img [src]="'https://mc-heads.net/avatar/'+username" />
                        </p-avatar>
                    </a>
                    <div
                        class="list-none p-2 m-0 rounded-2xl border border-surface overflow-hidden absolute bg-surface-0 dark:bg-surface-900 hidden origin-top w-52 mt-2 right-0 z-[999] top-auto shadow-[0px_56px_16px_0px_rgba(0,0,0,0.00),0px_36px_14px_0px_rgba(0,0,0,0.01),0px_20px_12px_0px_rgba(0,0,0,0.02),0px_9px_9px_0px_rgba(0,0,0,0.03),0px_2px_5px_0px_rgba(0,0,0,0.04)]"
                    >
                        <ul class="flex flex-col gap-1">
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-user"></i>
                                    <span>Profile</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-cog"></i>
                                    <span>Settings</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-calendar"></i>
                                    <span>Calendar</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-inbox"></i>
                                    <span>Inbox</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-power-off"></i>
                                    <span>Log out</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
    </div>`
})
export class AppTopbar implements OnInit{
    layoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.layoutService.isDarkTheme());

    protected username: string = "Steve";

    constructor(private authService: AuthService) {
    }

    public async ngOnInit(): Promise<void> {
        const currentUser = this.authService.currentUserValue;
        if(currentUser){
            this.username = currentUser.username;
        }
    }

    @ViewChild('menubutton') menuButton!: ElementRef;

    notificationsBars = signal<NotificationsBars[]>([
        {
            id: 'inbox',
            label: 'Inbox',
            badge: '2'
        },
        {
            id: 'general',
            label: 'General'
        },
        {
            id: 'archived',
            label: 'Archived'
        }
    ]);

    notifications = signal<any[]>([
        {
            id: 'inbox',
            data: [
                {
                    image: '/demo/images/avatar/avatar-square-m-2.jpg',
                    name: 'Michael Lee',
                    description: 'You have a new message from the support team regarding your recent inquiry.',
                    time: '1 hour ago',
                    new: true
                },
                {
                    image: '/demo/images/avatar/avatar-square-f-1.jpg',
                    name: 'Alice Johnson',
                    description: 'Your report has been successfully submitted and is under review.',
                    time: '10 minutes ago',
                    new: true
                },
                {
                    image: '/demo/images/avatar/avatar-square-f-2.jpg',
                    name: 'Emily Davis',
                    description: 'The project deadline has been updated to September 30th. Please check the details.',
                    time: 'Yesterday at 4:35 PM',
                    new: false
                }
            ]
        },
        {
            id: 'general',
            data: [
                {
                    image: '/demo/images/avatar/avatar-square-f-1.jpg',
                    name: 'Alice Johnson',
                    description: 'Reminder: Your subscription is about to expire in 3 days. Renew now to avoid interruption.',
                    time: '30 minutes ago',
                    new: true
                },
                {
                    image: '/demo/images/avatar/avatar-square-m-2.jpg',
                    name: 'Michael Lee',
                    description: 'The server maintenance has been completed successfully. No further downtime is expected.',
                    time: 'Yesterday at 2:15 PM',
                    new: false
                }
            ]
        },
        {
            id: 'archived',
            data: [
                {
                    image: '/demo/images/avatar/avatar-square-m-1.jpg',
                    name: 'Lucas Brown',
                    description: 'Your appointment with Dr. Anderson has been confirmed for October 12th at 10:00 AM.',
                    time: '1 week ago',
                    new: true
                },
                {
                    image: '/demo/images/avatar/avatar-square-f-2.jpg',
                    name: 'Emily Davis',
                    description: 'The document you uploaded has been successfully archived for future reference.',
                    time: '2 weeks ago',
                    new: false
                }
            ]
        }
    ]);

    selectedNotificationBar = model(this.notificationsBars()[0].id ?? 'inbox');

    selectedNotificationsBarData = computed(() => this.notifications().find((f) => f.id === this.selectedNotificationBar()).data);

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    showRightMenu() {
        this.layoutService.toggleRightMenu();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    toggleSearchBar() {
        this.layoutService.layoutState.update((value) => ({...value, searchBarActive: !value.searchBarActive}));
    }
}
