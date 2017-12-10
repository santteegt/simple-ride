import { Meteor} from 'meteor/meteor';
Accounts.onCreateUser(function (options, user) {

  console.log('NUEVO USUARIO YEAH!!!');

      if (!user.services.facebook) {
          return user;
      }
      console.log('creating user account from facebook profile');
      user.personData = {};
      user.personData.forename = user.services.facebook.first_name;
      user.personData.surname = user.services.facebook.last_name;
      user.personData.gender = user.services.facebook.gender;
      user.personData.email = user.services.facebook.email;
      user.personData.locale = user.services.facebook.locale;
      user.personData.profileImg = "https://graph.facebook.com/" + user.services.facebook.id + "/picture?type=large";
      user.personData.status = "new";
      user.driverData = {};
      user.paymentInfo = {};
      user.adminData = { 'isAdmin': false };

      console.log(JSON.stringify(user));

      return user;
    });
// Meteor.publish('userData', function (userId: string) {
  // Meteor.publish('userData', function () {
    Meteor.publish(null, function () {
  // Validate the arguments to be what we expect
  // new SimpleSchema({
  //   userIds: { type: [String] }
  // }).validate({ userIds });

  return Meteor.users.find({
      _id: this.userId
    },
      {
        fields: {
          personData: 1,
          driverData: 1,
          paymentInfo: 1
        }
    });

  // Select only the users that match the array of IDs passed in
  // const selector = {
  //   _id: this.userId;
  // };

  // // Only return one field, `initials`
  // const options = {
  //   fields: {
  //     personData: 1,
  //     driverData: 1
  //   }
  // };
  // console.log(" ======> "+ Meteor.users.find(selector, options).count());
  // Meteor.users.find(selector, options).forEach(function (user) {
  //   console.log(user);
  // });

  // return Meteor.users.find(selector, options);
});

Meteor.publish('user-public-data', function(users_id: string[]) {
  return Meteor.users.find(
    { _id: { $in: users_id } },
    {
      fields: {
        'personData.forename': 1,
        'personData.surname': 1,
        'personData.birthday': 1,
        'personData.gender': 1,
        'personData.profileImg': 1,
        'personData.city': 1,
        'personData.state': 1,
        'personData.conversation': 1,
        'personData.status': 1,
        'driverData': 1
      }
    });
})

Meteor.users.allow({
  update(userId, doc, fieldNames, modifier) { return fieldNames.indexOf("personData") != -1 || fieldNames.indexOf("driverData") != -1 || fieldNames.indexOf("paymentInfo") != -1; }
});


// Meteor.publish('Meteor.users.personData', function (userIds: string[]) {
//   console.log("personData");
//   // Validate the arguments to be what we expect
//   // new SimpleSchema({
//   //   userIds: { type: [String] }
//   // }).validate({ userIds });

//   // Select only the users that match the array of IDs passed in
//   const selector = {
//     _id: { $in: userIds }
//   };

//   // Only return one field, `initials`
//   const options = {
//     fields: {
//       personData: 1
//     }
//   };

//   return Meteor.users.find(selector, options);
// });

// Meteor.publish('Meteor.users.driverData', function (userIds: string[]) {
//   console.log("driverData");
//   // Validate the arguments to be what we expect
//   // new SimpleSchema({
//   //   userIds: { type: [String] }
//   // }).validate({ userIds });

//   // Select only the users that match the array of IDs passed in
//   const selector = {
//     _id: { $in: userIds }
//   };

//   // Only return one field, `initials`
//   const options = {
//     fields: {
//       driverData: 1
//     }
//   };

//   return Meteor.users.find(selector, options);
// });
