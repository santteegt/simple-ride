import { Meteor } from "meteor/meteor";
import {check} from 'meteor/check';
import { CarRecords } from '../../both/collections/car-records.collection';
import { CarRecord } from '../../both/models/car-record.model';
import { UserRecord } from '../../both/models/user-record.model';
import { UserRecords } from '../../both/collections/user-records.collection';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';

declare var cheerio;

let url = 'http://sistemaunico.ant.gob.ec:6033';
let to: string = 'malgia@hotmail.com';
let from: string = 'info@simpleride-ec.com';
let subject: string = 'Problema con ANT'

SSR.compileTemplate('generalEmail', Assets.getText("email-templates/general-email.html"));
/**
* Fix labels for car register data
*
*/
function fixLabel(label: string) {
	let newLabel = ''
	switch (label) {
		case "A&#xF1;o de Matr&#xED;cul":
			newLabel = 'anio_matricula'
			break;
		case "Fecha de Matr&#xED;cula":
			newLabel = 'fecha_matricula';
			break;
		case "A&#xF1;o":
			newLabel = 'anio';
			break;
		case "Fecha de Caducidad":
			newLabel = 'fcaducidad_matricula';
			break;
		default:
			newLabel = label.toLowerCase();
			break;
	}
	return newLabel;
}

async function sendEmail(to: string, from: string, subject: string, html: string){
	Email.send({ to, from, subject, html });
}

Meteor.methods({

 	crawlANTCarData: function(user_id: string, car_id: string) {
		check(car_id, String);

	  	if(Meteor.isServer) {
	  		let vehicleData = {};
	  		const requestOptions = {
			    npmRequestOptions: {
			      rejectUnauthorized: false
			    }
			 }

			 try {
				 let rs = Meteor['http'].call("GET", url + "/PortalWEB/paginas/clientes/clp_grid_citaciones.jsp?ps_tipo_identificacion=PLA&ps_identificacion="
					+ car_id.toUpperCase() + "&ps_placa=", requestOptions);
		  		if(rs.statusCode == 200) {

		  			if(rs.content.length > 0) {

						let updated = CarRecords.update({driver_id: user_id, active: true}, // deactivate old record
						{$set: {active: false}});

	  					let $ = cheerio.load(rs.content);
	  					let data = $('table tr:has(td.detalle_formulario)');

	  					data.each(function(row, data) {
	  						let currentLabel = '';
	  						$(data).find('td').each(function(col, dataCol) {
	  							let className = $(dataCol).attr('class');
	  							let value = $(dataCol).html();
	  							if(className == 'titulo') {
	  								currentLabel = fixLabel(value.substr(0, value.length - 1));
	  							} else if(className == 'detalle_formulario') {
	  								vehicleData[currentLabel] = value;
	  							}
	  						});
	  					});
	  					console.log(vehicleData);
	  					CarRecords.insert({
	  						driver_id: user_id,
	  						creationDate: new Date(),
	  						active: true,
	  						brand: vehicleData['marca'],
	  						color: vehicleData['color'],
	  						model: vehicleData['modelo'],
	  						class: vehicleData['clase'],
	  						year: vehicleData['anio'],
	  						register_year: vehicleData['anio_matricula'],
	  						register_date: vehicleData['fecha_matricula'],
	  						service_type: vehicleData['servicio'],
	  						register_expiryDate: vehicleData['fcaducidad_matricula']


	  					});
	  					return {found: vehicleData['marca'] ? true:false, vehicleData: vehicleData};

	  				}
	  				return {found: false, vehicleData: undefined};

		  		} else {
		  			throw new Meteor.Error("crawler-error", "Cannot crawl data from ANT");
		  		}
			 } catch (e) {
				 let html: string = SSR.render("generalEmail", {title: subject, content: 'La url '+url+' parece estar caida. Por favor revisar.'});
				 sendEmail(to, from, subject, html);
				 return {found: false, vehicleData: undefined};
			 }
  		}
  	},

  	crawlANTPersonData: function(user_id: string, person_id: string) {
  		check(person_id, String);

	  	if(Meteor.isServer) {
	  		let personData = {};
	  		const requestOptions = {
			    npmRequestOptions: {
			      rejectUnauthorized: false
			    }
			 }

			 try {
				 let rs = Meteor['http'].call("GET", url + "/PortalWEB/paginas/clientes/clp_grid_citaciones.jsp?ps_tipo_identificacion=CED&ps_identificacion="
					+ person_id + "&ps_placa=", requestOptions);

		  		if(rs.statusCode == 200) {
		  			if(rs.content.length > 0) {

						let $ = cheerio.load(rs.content);

						let data = $('table.MarcoTitulo tr:has(td.titulo1, td.detalle_formulario)');
						data.each(function(row, data) {

							let currentLabel = '';
							$(data).find('td').each(function(col, dataCol) {
								let value = $(dataCol).html();
								if(row == 0) { //name and license points
									switch (col) {
										case 0:
											personData['name'] = value.substr(0,value.indexOf('&'));
											break;
									case 2:
										personData['points'] = value;
										break;
										default:
											break;
									}
								}
								if(row == 1) { //license description
									let license_type = value.substr(value.indexOf("TIPO: ") + 6, 2).trim();
									license_type = license_type.indexOf('&') > -1 ?
										license_type.substr(0, license_type.indexOf('&')):license_type;
									personData['license_type'] = license_type;
									personData['license_expire'] = value.substr(value.indexOf(" - ") + 3, 10);
								}
							});
						});
						console.log(personData);

						let updated = UserRecords.update({user_id: user_id},
						{$set: {
							license_info: {
								name: personData['name'],
								points: personData['points'],
								license_type: personData['license_type'],
								license_expire: personData['license_expire']
							}
						}});
						return {found: true, license_info: personData};
					}
					return {found: false, license_info: undefined};

		  		} else {
		  			throw new Meteor.Error("crawler-error", "Cannot crawl data from ANT");
		  		}
			 } catch (e) {
				 let html: string = SSR.render("generalEmail", {title: subject, content: 'La url '+url+' parece estar caida. Por favor revisar.'});
				 sendEmail(to, from, subject, html);
				 return {found: false, license_info: undefined};
			 }
	  	}
	},

	getPoliceRecord: function(user_id: string, person_id: string, is_passport: boolean) {
  		check(user_id, String);
  		check(person_id, String);
  		check(is_passport, Boolean);

  		if(Meteor.isServer) {
			try {
				let rs = Meteor['http'].call("POST", "http://www.mdi.gob.ec/minterior1/antecedentes/data.php",
											{
												headers: {
													"Content-Type": "application/x-www-form-urlencoded",
													"Accept": '*/*'

												},
												params: {
													'tipo': 'getDataWs',
													'ci': person_id,
													'tp': is_passport ? 'P':'C',
													'ise': is_passport ? 'NO':'SI'
												}
											});

				if(rs.statusCode == 200) {

					console.log(rs);

					let data = JSON.parse(rs.content)[0]; // {error: string, identity: string, name: string, antecedent: SI/NO, seclusion: SI/NO, idr: string, type: CEDULA/PASAPORTE}

					if(data.error.length == 0) { // id is correct

						let updated = UserRecords.update({user_id: user_id, active: true}, // deactivate old record
							{$set: {active: false}});

						let userRecord = {
							user_id: user_id,
							query_date: new Date(),
							active: true,
							is_passport: is_passport,
							person_id: data.identity.length > 0 ? data.identity:person_id,
							name: data.name,
							antecedent: data.antecedent,
							seclusion: data.seclusion,
							idr: data.idr
						}

						UserRecords.insert(userRecord);

						return {found: true, response: userRecord};

					} else {
						return {found: false, response: undefined};
					}

				} else {
					throw new Meteor.Error("crawler-error", "Cannot crawl data from Interior Ministry: ");
				}
			} catch (e) {
				let subject: string = 'Problema con MDI';
				let html: string = SSR.render("generalEmail", {title: subject, content: 'La url http://www.mdi.gob.ec/minterior1/antecedentes/data.php parece estar caida. Por favor revisar.'});
				sendEmail(to, from, subject, html);
				return {found: false, response: {idr: 'error'}};
			}
		}
	}


});
