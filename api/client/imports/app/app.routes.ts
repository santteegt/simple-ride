import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { DashboardComponent } from './web/dashboard.component.web';
import { DocumentBrowserComponent } from './web/admin/docs-browser.component.web';
import { LoginComponent } from './web/admin/login.component.web';
import { TripsComponent } from './web/admin/trips.component.web';
import { TripComponent } from './web/admin/trip.component.web';
import { SharedTripComponent } from './web/share/shared-trip.component.web';
import { CampaingsComponent } from './web/admin/campaings.component.web';
import { UsersComponent } from './web/admin/users.component.web';
import { UserComponent } from './web/admin/user.component.web';

export const routes: Route[] = [
  { path: '', component: DashboardComponent},
  { path: 'privacy-policy', component: DashboardComponent },
  { path: 'tyc', component: DashboardComponent },
  { path: 'admin', component: LoginComponent },
  { path: 'admin/docs', component: DocumentBrowserComponent },
  { path: 'admin/trips', component: TripsComponent },
  { path: 'admin/trip/:id', component: TripComponent },
  { path: 'share/trip/:id', component: SharedTripComponent },
  { path: 'admin/campaings', component: CampaingsComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'admin/user/:id', component: UserComponent },
  // { path: 'party/:partyId', component: PartyDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
];

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}];
