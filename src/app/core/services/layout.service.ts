import {computed, effect, Injectable, signal} from '@angular/core';
import {Subject} from 'rxjs';

// Clé de stockage dans le localStorage
const LAYOUT_CONFIG_KEY = 'bastionmc-layout-config';

export interface layoutConfig {
    preset: string;
    primary: string;
    surface: string | undefined | null;
    darkTheme: boolean;
    menuMode: string;
    menuTheme: string;
    cardStyle: string;
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
    sidebarActive: boolean;
    anchored: boolean;
    overlaySubmenuActive: boolean;
    rightMenuVisible: boolean;
    searchBarActive: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    _config: layoutConfig = {
        preset: 'Aura',
        primary: 'blue',
        surface: null,
        darkTheme: true,
        menuMode: 'static',
        menuTheme: 'dark',
        cardStyle: 'transparent'
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        rightMenuVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        searchBarActive: false,
        sidebarActive: false,
        anchored: false,
        overlaySubmenuActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);
    isDarkTheme = computed(() => this.layoutConfig().darkTheme);
    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive || this.layoutState().overlaySubmenuActive);
    isSlim = computed(() => this.layoutConfig().menuMode === 'slim');
    isHorizontal = computed(() => this.layoutConfig().menuMode === 'horizontal');
    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');
    isCompact = computed(() => this.layoutConfig().menuMode === 'compact');
    isStatic = computed(() => this.layoutConfig().menuMode === 'static');
    isReveal = computed(() => this.layoutConfig().menuMode === 'reveal');
    isDrawer = computed(() => this.layoutConfig().menuMode === 'drawer');
    transitionComplete = signal<boolean>(false);
    isSidebarStateChanged = computed(() => {
        const layoutConfig = this.layoutConfig();
        return layoutConfig.menuMode === 'horizontal' || layoutConfig.menuMode === 'slim' || layoutConfig.menuMode === 'slim-plus';
    });
    private configUpdate = new Subject<layoutConfig>();
    configUpdate$ = this.configUpdate.asObservable();
    private overlayOpen = new Subject<any>();
    overlayOpen$ = this.overlayOpen.asObservable();
    private menuSource = new Subject<MenuChangeEvent>();
    menuSource$ = this.menuSource.asObservable();
    private resetSource = new Subject();
    resetSource$ = this.resetSource.asObservable();
    private initialized = false;

    constructor() {
        // Charger la configuration à partir du localStorage au démarrage
        this.loadConfigFromStorage();

        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();

                // Sauvegarder la configuration dans le localStorage à chaque changement
                if (this.initialized) {
                    this.saveConfigToStorage();
                }
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });

        effect(() => {
            this.isSidebarStateChanged() && this.reset();
        });
    }

    /**
     * Sauvegarde la configuration dans le localStorage
     */
    private saveConfigToStorage(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            const configToSave = this.layoutConfig();
            localStorage.setItem(LAYOUT_CONFIG_KEY, JSON.stringify(configToSave));
        }
    }

    /**
     * Charge la configuration depuis le localStorage
     */
    private loadConfigFromStorage(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedConfig = localStorage.getItem(LAYOUT_CONFIG_KEY);

            if (storedConfig) {
                try {
                    const parsedConfig = JSON.parse(storedConfig);
                    this._config = { ...this._config, ...parsedConfig };
                    this.layoutConfig.set(this._config);

                    // Appliquer immédiatement le thème sombre si nécessaire
                    if (this._config.darkTheme) {
                        document.documentElement.classList.add('app-dark');
                    } else {
                        document.documentElement.classList.remove('app-dark');
                    }
                } catch (e) {
                    console.error('Erreur lors du chargement de la configuration:', e);
                }
            }
        }

        this.initialized = true;
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    toggleConfigSidebar() {
        if (this.isSidebarActive()) {
            this.updateLayoutState({
                overlayMenuActive: false,
                overlaySubmenuActive: false,
                staticMenuMobileActive: false,
                menuHoverActive: false,
                configSidebarVisible: false
            });
        }
        this.updateLayoutState({
            configSidebarVisible: true
        });
    }

    updateLayoutState(newState: Partial<any>) {
        this.layoutState.update((prev) => ({
            ...prev,
            ...newState
        }));
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.updateLayoutState({overlayMenuActive: !this.layoutState().overlayMenuActive});

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.updateLayoutState({staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive});
        } else {
            this.updateLayoutState({staticMenuMobileActive: !this.layoutState().staticMenuMobileActive});

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    onConfigUpdate() {
        this._config = {...this.layoutConfig()};
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }

    onOverlaySubmenuOpen() {
        this.overlayOpen.next(null);
    }

    showProfileSidebar() {
        this.updateLayoutState({profileSidebarVisible: true});
    }

    showConfigSidebar() {
        this.updateLayoutState({configSidebarVisible: true});
    }

    hideConfigSidebar() {
        this.updateLayoutState({configSidebarVisible: false});
    }

    toggleRightMenu() {
        this.updateLayoutState({rightMenuVisible: !this.layoutState().rightMenuVisible});
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        const supportsViewTransition = 'startViewTransition' in document;

        if (supportsViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {
            });
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }
}
