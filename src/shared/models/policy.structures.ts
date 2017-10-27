import { UserRecord } from './user-record.model';

export interface PoliceRecord {
	found: boolean,
	response: UserRecord,
	registered: boolean
}

export interface CarRecord {
	found: boolean,
	vehicleData: {
		marca: string,
  		color: string,
	  	modelo: string,
		clase: string,
		anio: string,
		anio_matricula: string,
  		fecha_matricula: string,
  		servicio: string,
  		fcaducidad_matricula: string
	}
}

export interface LicenseRecord {
	found: boolean,
	license_info: {
		name: string,
		points: string,
		license_type: string,
		license_expire: string
	}
}
