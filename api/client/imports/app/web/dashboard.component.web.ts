import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { Dashboard } from "../shared-components/dashboard.class";
import { Jsonp } from '@angular/http';

import template from './dashboard.component.web.html';
import style from './dashboard.component.web.scss';

declare var $;

interface Slide {
	img: string;
	text: string;
}

@Component({
  selector: 'dashboard',
  template,
  styles: [ style ]
})
export class DashboardComponent {
// export class DashboardComponent extends Dashboard {

	email: string;
	response: string;

  driverSlides: Slide[];
  userSlides: Slide[];

	showPrivacyModal:boolean;
	showTyCModal:boolean;
	router: any;

  constructor(private jsonp: Jsonp, private _router: Router) {
    // super("Hello World!");
    this.driverSlides = [
      {img:'assets/descarga.png', text: '1. Descarga la app'},
      {img:'assets/perfil.png', text: '2. Crea tu perfil'},
      {img:'assets/agrega.png', text: '3. Agrega tu viaje'},
      {img:'assets/acepta.png', text: '4. Acepta los viajeros'},
      {img:'assets/viaja.png', text: '5. ¡Viaja!'}
    ];
    this.userSlides = [
      {img:'assets/descarga.png', text: '1. Descarga la app'},
      {img:'assets/perfil.png', text: '2. Crea tu perfil'},
      {img:'assets/viajes-disponibles.png', text: '3. Busca viajes disponibles'},
      {img:'assets/pago.png', text: '4. Realiza el pago'},
      {img:'assets/viaja.png', text: '5. ¡Viaja!'}
    ];
		this.showPrivacyModal = false;
		this.showTyCModal = false;
		this.router = _router;
  }

  scrollTo(event: any){
    let target = $(event.target.hash);
    console.log(target);
    $('html, body').animate({
      scrollTop: target.offset().top + 50
    }, 600);
  }

  scrollToTarget(target: string){
    $('html,body').animate({
      scrollTop: $("#"+target).offset().top
    }, 'slow');
  }

	onSubmit(){
		let url = '//belair.us7.list-manage.com/subscribe/post-json?u=025cf876472c3694c155c22b9&id=4ee2e6db68&EMAIL='+ this.email +'&c=JSONP_CALLBACK';
		this.jsonp.request(url, { method: 'GET' }).subscribe((res) => {
			if(res.status == 200){
				this.response = 'Por favor revisa tu correo electrónico para confirmar tu subscripción'
				this.email = '';
			}
		});
	}

	ngOnInit(){
		this.scrollToTarget('home');
		if(this.router.url=='/privacy-policy'){
			this.showPrivacyModal = true;
		}
		if(this.router.url=='/tyc'){
			this.showTyCModal = true;
		}
	}
}
