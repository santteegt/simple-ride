module.exports = {
  servers: {
    one: {
      host: 'ec2-52-40-65-210.us-west-2.compute.amazonaws.com',
      username: 'ubuntu',
      pem: '/Users/santteegt/SimpleRide.pem'
      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },

  meteor: {
    name: 'SimpleRide',
    path: '/Users/santteegt/GitRepositories/simple-ride/api',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: true,
      executable: 'meteor'
    },
    env: {
      ROOT_URL: 'https://simpleride-ec.com/',
      MONGO_URL: 'mongodb://localhost/meteor',
      MAIL_URL: 'smtp://AKIAIOMAWOJNRT6PIZIQ:AsG95hdbC7gttdL+PNNorH8ohdK72x8S+nK7JtNEFAFT@email-smtp.us-west-2.amazonaws.com:587'

    },
    docker: {
      image: 'abernix/meteord:base'
    },
    //dockerImage: 'kadirahq/meteord'
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    version: '3.4.1',
    servers: {
      one: {},
    },
  },
};