import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { usercreds } from '../../models/interfaces/usercreds';
import { ToastController } from 'ionic-angular';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthProvider {
  
  constructor(public afireauth: AngularFireAuth, public toastCtrl: ToastController) {

  }

/*
    For logging in a particular user. Called from the login.ts file.
  
*/  
  
  login(credentials: usercreds) {
    var toaster = this.toastCtrl.create({
      duration: 3000,
      position: 'bottom'
    });
    var promise = new Promise((resolve, reject) => {
      this.afireauth.auth.signInWithEmailAndPassword(credentials.email, credentials.password).then(() => {
        resolve(true);
      }).catch((err) => {
        toaster.setMessage(err.message);
        toaster.present();
       })
    })

    return promise;
    
  }

}