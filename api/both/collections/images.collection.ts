import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { Image } from "../models/image.model";
 
export const Images = new MongoObservable.Collection<Image>('images');

function loggedIn() {
  return !!Meteor.user();
}

Images.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: () => {return false;}
});
 
export const ImagesStore = new UploadFS.store.GridFS({
  collection: Images.collection,
  name: 'images',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  }),
  // copyTo: [
  //   ThumbsStore
  // ],
  permissions: new UploadFS.StorePermissions({
    insert(userId, doc) {
        return true;
    },
    update(userId, doc) {
        return true;
    },
    remove(userId, doc) {
        return false;
    }
  })
});