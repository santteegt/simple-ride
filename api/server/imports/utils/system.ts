import { ConfigVars } from '../../../both/collections';
import { ConfigVar, CONFIG_VARS } from '../../../both/models';


export class SystemUtils {


	public static initConfig() {

		console.log('==========Initializing System Configuration==========');
		let antServiceConfig: ConfigVar = ConfigVars.findOne({name: CONFIG_VARS.ANT_URL, active: true});
		if(!antServiceConfig) {
			antServiceConfig = {
				name: CONFIG_VARS.ANT_URL, 
				value: 'http://sistemaunico.ant.gob.ec:6033',
				// value: 'https://sistemaunico.ant.gob.ec:5038',
				creation_date: new Date(),
				active: true
			};
			ConfigVars.insert(antServiceConfig);
		}
		console.log("ANT_URL service config ", antServiceConfig);

		console.log('=====================================================');
	
	}

	public static getANTServiceURL() {
		let antServiceConfig: ConfigVar = ConfigVars.findOne({name: CONFIG_VARS.ANT_URL, active: true});
		return antServiceConfig.value;
	}
}

