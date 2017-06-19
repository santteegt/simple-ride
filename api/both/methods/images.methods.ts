import { UploadFS } from 'meteor/jalik:ufs';
import { ImagesStore } from '../collections/images.collection';
 
export function upload(data, user_id: string, doc_type: number, rsvp_id?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // pick from an object only: name, type and size
    const file = {
      name: data.name,
      type: data.type,
      size: data.size,
      user_id: user_id,
      rsvp_id: rsvp_id,
      doc_type: doc_type
    };
 
    const upload = new UploadFS.Uploader({
      data,
      file,
      store: ImagesStore,
      onError: reject,
      onComplete: resolve
    });
 
    upload.start();
  });
}